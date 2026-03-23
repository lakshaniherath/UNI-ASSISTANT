package com.unibuddy.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unibuddy.backend.dto.TimetableEventDTO;
import com.unibuddy.backend.dto.TimetableRecoveryRequestDTO;
import com.unibuddy.backend.dto.TimetableRecoveryResponseDTO;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TimetableService {

    private static final List<String> WD_FILES = List.of(
            "timetables/weekday/subgroup_timetable_Y3.S1.WD.IT.01.json",
            "timetables/weekday/subgroup_timetable_Y3.S1.WD.IT.02.json",
            "timetables/weekday/subgroup_timetable_Y3.S1.WD.IT.03.json"
    );

    private static final List<String> WE_FILES = List.of(
            "timetables/weekend/subgroup_timetable_Y3.S1.WE.IT.01.json",
            "timetables/weekend/subgroup_timetable_Y3.S1.WE.IT.02.json",
            "timetables/weekend/subgroup_timetable_Y3.S1.WE.IT.03.json",
            "timetables/weekend/subgroup_timetable_Y3.S1.WE.IT.04.json"
    );

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final Map<String, Integer> DAY_ORDER = Map.of(
            "MONDAY", 1, "TUESDAY", 2, "WEDNESDAY", 3, "THURSDAY", 4, "FRIDAY", 5, "SATURDAY", 6, "SUNDAY", 7
    );

    private final ObjectMapper objectMapper;
    private final Map<String, List<TimetableEventDTO>> eventsBySubgroup = new HashMap<>();
    private final Map<String, TimetableEventDTO> eventById = new HashMap<>();
    private final List<TimetableEventDTO> wdEvents = new ArrayList<>();
    private final List<TimetableEventDTO> weEvents = new ArrayList<>();

    public TimetableService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void loadTimetables() {
        eventsBySubgroup.clear();
        eventById.clear();
        wdEvents.clear();
        weEvents.clear();

        loadFromFiles(WD_FILES, "WD");
        loadFromFiles(WE_FILES, "WE");

        // Deduplicate events per subgroup by ID (same event can be added from multiple files)
        for (Map.Entry<String, List<TimetableEventDTO>> entry : eventsBySubgroup.entrySet()) {
            LinkedHashMap<String, TimetableEventDTO> seen = new LinkedHashMap<>();
            for (TimetableEventDTO e : entry.getValue()) {
                seen.putIfAbsent(e.getId(), e);
            }
            List<TimetableEventDTO> deduped = new ArrayList<>(seen.values());
            deduped.sort(this::compareByDayTime);
            entry.setValue(deduped);
        }
    }

    public List<TimetableEventDTO> getTimetableForSubgroup(String subgroup) {
        return eventsBySubgroup.getOrDefault(subgroup, List.of());
    }

    public TimetableRecoveryResponseDTO getRecoverySuggestions(TimetableRecoveryRequestDTO request) {
        TimetableEventDTO original = eventById.get(request.getMissedEventId());
        if (original == null) {
            throw new RuntimeException("Missed event not found: " + request.getMissedEventId());
        }

        String studentSubgroup = request.getStudentSubgroup();
        if (studentSubgroup == null || studentSubgroup.isBlank()) {
            studentSubgroup = original.getSubgroup();
        }

        boolean studentIsWd = studentSubgroup.contains(".WD.");
        List<TimetableEventDTO> targetPool = studentIsWd ? weEvents : wdEvents;
        LocalDateTime now = LocalDateTime.now();

        final String moduleCode = normalize(original.getModuleCode());
        final String activityType = normalize(original.getActivityType());
        final String lecturer = normalize(original.getLecturer());

        if (moduleCode.isBlank()) {
            return new TimetableRecoveryResponseDTO(original, List.of());
        }

        List<TimetableEventDTO> alternatives = targetPool.stream()
                .filter(e -> moduleCode.equals(normalize(e.getModuleCode())))
                .filter(e -> activityMatches(activityType, normalize(e.getActivityType())))
                .filter(e -> !Objects.equals(e.getId(), original.getId()))
                .filter(e -> isValidWindowForRecovery(e, studentIsWd, now))
                .sorted((a, b) -> compareRecoveryPriority(a, b, lecturer, studentIsWd, now))
                .limit(6)
                .collect(Collectors.toList());

        return new TimetableRecoveryResponseDTO(original, alternatives);
    }

    private void loadFromFiles(List<String> files, String batchType) {
        for (String path : files) {
            try (InputStream is = new ClassPathResource(path).getInputStream()) {
                JsonNode root = objectMapper.readTree(is);
                parseRoot(root, batchType);
            } catch (IOException e) {
                throw new RuntimeException("Failed to read timetable JSON: " + path, e);
            }
        }
    }

    private void parseRoot(JsonNode root, String batchType) {
        String mainGroup = getText(root, "group");
        List<String> fileSubgroups = new ArrayList<>();
        for (JsonNode sg : root.path("subgroups")) {
            fileSubgroups.add(sg.asText());
        }

        for (JsonNode event : root.path("events")) {
            String eventSubgroup = getText(event, "subgroup");
            String day = normalizeDay(getText(event, "day"));
            String start = normalizeTime(getText(event, "start"), "08:00");
            String end = normalizeTime(getText(event, "end"), addOneHour(start));
            String title = getText(event, "title");
            String moduleCode = firstNonBlank(getText(event, "module_code"), extractModuleCode(title));

            if (moduleCode.isBlank() && event.path("raw").isArray()) {
                for (JsonNode n : event.path("raw")) {
                    String mc = extractModuleCode(n.asText(""));
                    if (!mc.isBlank()) {
                        moduleCode = mc;
                        title = n.asText("");
                        break;
                    }
                }
            }

            String activityType = inferActivityType(title);
            String moduleName = extractModuleName(title, moduleCode);
            String location = getText(event, "location");
            String lecturer = getText(event, "instructors");

            List<String> targets = resolveTargetSubgroups(event, mainGroup, fileSubgroups, eventSubgroup);
            for (String targetSubgroup : targets) {
                TimetableEventDTO dto = new TimetableEventDTO(
                        buildStableId(mainGroup, targetSubgroup, day, start, title, location),
                        batchType,
                        mainGroup,
                        targetSubgroup,
                        day,
                        start,
                        end,
                        moduleCode,
                        moduleName,
                        activityType,
                        location,
                        lecturer
                );
                eventsBySubgroup.computeIfAbsent(targetSubgroup, x -> new ArrayList<>()).add(dto);
                eventById.put(dto.getId(), dto);
                if ("WD".equals(batchType)) {
                    wdEvents.add(dto);
                } else {
                    weEvents.add(dto);
                }
            }
        }
    }

    private List<String> resolveTargetSubgroups(JsonNode event, String mainGroup, List<String> fileSubgroups, String fallbackSubgroup) {
        List<String> rawLabels = new ArrayList<>();
        JsonNode raw = event.path("raw");
        if (raw.isArray()) {
            for (JsonNode node : raw) {
                String text = node.asText("");
                Arrays.stream(text.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isBlank())
                        .forEach(rawLabels::add);
            }
        }

        boolean mentionsMainGroup = rawLabels.stream().anyMatch(label -> label.equalsIgnoreCase(mainGroup));
        if (mentionsMainGroup) {
            return fileSubgroups;
        }

        List<String> explicitSubgroups = rawLabels.stream()
                .filter(fileSubgroups::contains)
                .collect(Collectors.toList());
        if (!explicitSubgroups.isEmpty()) {
            return explicitSubgroups;
        }

        if (fallbackSubgroup != null && !fallbackSubgroup.isBlank()) {
            return List.of(fallbackSubgroup);
        }
        return fileSubgroups;
    }

    private boolean isValidWindowForRecovery(TimetableEventDTO e, boolean studentIsWd, LocalDateTime now) {
        LocalDateTime candidateDateTime = nextOccurrence(e, now, studentIsWd);
        if (candidateDateTime == null) {
            return false;
        }
        if (studentIsWd) {
            return !candidateDateTime.isBefore(now) && Duration.between(now, candidateDateTime).toDays() <= 14;
        }
        return !candidateDateTime.isBefore(now) && Duration.between(now, candidateDateTime).toDays() <= 10;
    }

    private int compareRecoveryPriority(TimetableEventDTO a, TimetableEventDTO b, String originalLecturer, boolean studentIsWd, LocalDateTime now) {
        LocalDateTime aTime = nextOccurrence(a, now, studentIsWd);
        LocalDateTime bTime = nextOccurrence(b, now, studentIsWd);
        long aDiff = Duration.between(now, aTime).toMinutes();
        long bDiff = Duration.between(now, bTime).toMinutes();
        if (aDiff != bDiff) {
            return Long.compare(aDiff, bDiff);
        }
        boolean aLecturerMatch = normalize(a.getLecturer()).equals(originalLecturer);
        boolean bLecturerMatch = normalize(b.getLecturer()).equals(originalLecturer);
        if (aLecturerMatch != bLecturerMatch) {
            return aLecturerMatch ? -1 : 1;
        }
        return compareByDayTime(a, b);
    }

    private LocalDateTime nextOccurrence(TimetableEventDTO event, LocalDateTime now, boolean studentIsWd) {
        DayOfWeek day = DayOfWeek.valueOf(event.getDayOfWeek());
        LocalTime time = LocalTime.parse(event.getStartTime(), TIME_FMT);

        LocalDate next = now.toLocalDate().with(TemporalAdjusters.nextOrSame(day));
        LocalDateTime candidate = LocalDateTime.of(next, time);

        if (studentIsWd) {
            // WD student recovering from WE: weekend slots in next 14 days.
            return candidate;
        }

        // WE student recovering from WD: prefer this week weekdays if still upcoming, otherwise next week.
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return null;
        }

        LocalDate weekStart = now.toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate thisWeekDay = weekStart.plusDays(day.getValue() - 1L);
        LocalDateTime thisWeekDateTime = LocalDateTime.of(thisWeekDay, time);
        if (!thisWeekDateTime.isBefore(now)) {
            return thisWeekDateTime;
        }
        return thisWeekDateTime.plusWeeks(1);
    }

    private int compareByDayTime(TimetableEventDTO a, TimetableEventDTO b) {
        int dayCmp = Integer.compare(
                DAY_ORDER.getOrDefault(a.getDayOfWeek(), 99),
                DAY_ORDER.getOrDefault(b.getDayOfWeek(), 99)
        );
        if (dayCmp != 0) {
            return dayCmp;
        }
        return a.getStartTime().compareTo(b.getStartTime());
    }

    private static boolean activityMatches(String original, String candidate) {
        if (original.isBlank() || candidate.isBlank()) {
            return true;
        }
        return original.equals(candidate);
    }

    private static String inferActivityType(String title) {
        String lower = normalize(title).toLowerCase(Locale.ROOT);
        if (lower.contains("lecture")) {
            return "LECTURE";
        }
        if (lower.contains("tutorial")) {
            return "TUTORIAL";
        }
        if (lower.contains("practical")) {
            return "PRACTICAL";
        }
        return "OTHER";
    }

    private static String extractModuleCode(String title) {
        if (title == null) {
            return "";
        }
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("([A-Z]{2}\\d{4})").matcher(title);
        return m.find() ? m.group(1) : "";
    }

    private static String extractModuleName(String title, String moduleCode) {
        if (title == null || title.isBlank()) {
            return "";
        }
        String clean = title;
        if (moduleCode != null && !moduleCode.isBlank()) {
            clean = clean.replace(moduleCode, "").replaceFirst("^\\s*-\\s*", "").trim();
            int split = clean.toLowerCase(Locale.ROOT).indexOf("lecture");
            if (split < 0) split = clean.toLowerCase(Locale.ROOT).indexOf("tutorial");
            if (split < 0) split = clean.toLowerCase(Locale.ROOT).indexOf("practical");
            if (split > 0) {
                clean = clean.substring(0, split).trim();
            }
        }
        return clean;
    }

    private static String normalizeDay(String day) {
        if (day == null || day.isBlank()) {
            return "MONDAY";
        }
        return day.trim().toUpperCase(Locale.ROOT);
    }

    private static String normalizeTime(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private static String addOneHour(String start) {
        try {
            LocalTime t = LocalTime.parse(start, TIME_FMT).plusHours(1);
            return t.format(TIME_FMT);
        } catch (Exception ex) {
            return start;
        }
    }

    private static String firstNonBlank(String a, String b) {
        return (a != null && !a.isBlank()) ? a : (b != null ? b : "");
    }

    private static String getText(JsonNode node, String key) {
        JsonNode value = node.path(key);
        return value.isMissingNode() || value.isNull() ? "" : value.asText("");
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private static String buildStableId(String mainGroup, String subgroup, String day, String start, String title, String location) {
        String payload = mainGroup + "|" + subgroup + "|" + day + "|" + start + "|" + title + "|" + location;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] bytes = md.digest(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.substring(0, 20);
        } catch (Exception ex) {
            return UUID.randomUUID().toString();
        }
    }
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = 'unibuddy.hasSeenOnboarding';

const logoSource = require('../../assets/app-logo-source.png');

const slides = [
  {
    id: 'discover',
    eyebrow: 'Welcome To UniBuddy',
    title: 'Your student life,\norganized in one place.',
    description:
      'Plan lectures, deadlines, and group work with a cleaner rhythm built around your university day.',
    accent: '#0C4A7A',
    accentSoft: '#DCEEFF',
    highlight: '#F28C28',
    statLabel: 'All-in-one focus',
    statValue: 'Timetable + tasks + teams',
    bullets: ['Smart study tools', 'Fast access to what matters', 'A calmer daily routine'],
  },
  {
    id: 'track',
    eyebrow: 'Stay On Track',
    title: 'Never lose sight of\nclasses or deadlines.',
    description:
      'Get a clearer view of your schedule, follow important reminders, and keep every week moving forward.',
    accent: '#123E73',
    accentSoft: '#E7F0FF',
    highlight: '#FF9F43',
    statLabel: 'Built for momentum',
    statValue: 'See today, plan tomorrow',
    bullets: ['Class reminders', 'Deadline awareness', 'Weekly clarity'],
  },
  {
    id: 'connect',
    eyebrow: 'Collaborate Better',
    title: 'Find your flow with\nstudy groups and goals.',
    description:
      'Coordinate projects, manage tasks, and move from planning to progress with confidence.',
    accent: '#0F3561',
    accentSoft: '#E3EEFF',
    highlight: '#F59E0B',
    statLabel: 'Progress together',
    statValue: 'Groups, tasks, and support',
    bullets: ['Team coordination', 'Task visibility', 'More confident execution'],
  },
] as const;

const OnboardingScreen = ({ navigation }: any) => {
  const listRef = useRef<FlatList<(typeof slides)[number]>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  const handleNext = () => {
    if (index === slides.length - 1) {
      completeOnboarding();
      return;
    }

    const nextIndex = index + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setIndex(nextIndex);
  };

  const activeSlide = slides[index];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#06111F" />

      <View style={styles.screenBackground}>
        <View style={styles.backgroundGlowTop} />
        <View style={styles.backgroundGlowBottom} />

        <View style={styles.header}>
          <View style={styles.brandPill}>
            <View style={styles.brandPillDot} />
            <Text style={styles.brandPillText}>UniBuddy</Text>
          </View>

          <TouchableOpacity style={styles.skipButton} onPress={completeOnboarding}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Animated.FlatList
          ref={listRef}
          data={slides}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          style={styles.carousel}
          renderItem={({ item, index: itemIndex }) => {
            const inputRange = [
              (itemIndex - 1) * width,
              itemIndex * width,
              (itemIndex + 1) * width,
            ];

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.25, 1, 0.25],
              extrapolate: 'clamp',
            });

            const translateY = scrollX.interpolate({
              inputRange,
              outputRange: [18, 0, 18],
              extrapolate: 'clamp',
            });

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.94, 1, 0.94],
              extrapolate: 'clamp',
            });

            return (
              <ScrollView
                style={styles.slide}
                contentContainerStyle={styles.slideContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                nestedScrollEnabled
              >
                <Animated.View
                  style={[
                    styles.heroCard,
                    {
                      opacity,
                      transform: [{ translateY }, { scale }],
                    },
                  ]}
                >
                  <View style={[styles.heroAura, { backgroundColor: item.accentSoft }]} />
                  <View
                    style={[
                      styles.heroAccentArc,
                      {
                        borderColor: item.highlight,
                        shadowColor: item.highlight,
                      },
                    ]}
                  />

                  <View style={[styles.heroBadge, { backgroundColor: item.accent }]}>
                    <Text style={styles.heroBadgeText}>{item.eyebrow}</Text>
                  </View>

                  <View style={styles.logoShell}>
                    <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>{item.statLabel}</Text>
                    <Text style={[styles.statValue, { color: item.accent }]}>{item.statValue}</Text>
                  </View>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.contentBlock,
                    {
                      opacity,
                      transform: [{ translateY }],
                    },
                  ]}
                >
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description}>{item.description}</Text>

                  <View style={styles.bulletList}>
                    {item.bullets.map(bullet => (
                      <View key={bullet} style={styles.bulletRow}>
                        <View
                          style={[
                            styles.bulletMarker,
                            {
                              backgroundColor: item.highlight,
                              shadowColor: item.highlight,
                            },
                          ]}
                        />
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              </ScrollView>
            );
          }}
        />

        <View style={styles.footer}>
          <View style={styles.paginationRow}>
            {slides.map((slide, dotIndex) => (
              <Animated.View
                key={slide.id}
                style={[
                  styles.paginationDot,
                  dotIndex === index
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                  {
                    opacity: scrollX.interpolate({
                      inputRange: [
                        (dotIndex - 1) * width,
                        dotIndex * width,
                        (dotIndex + 1) * width,
                      ],
                      outputRange: [0.45, 1, 0.45],
                      extrapolate: 'clamp',
                    }),
                    transform: [
                      {
                        scaleX: scrollX.interpolate({
                          inputRange: [
                            (dotIndex - 1) * width,
                            dotIndex * width,
                            (dotIndex + 1) * width,
                          ],
                          outputRange: [1, 3.4, 1],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: activeSlide.accent }]}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {index === slides.length - 1 ? 'Start With UniBuddy' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#06111F',
  },
  screenBackground: {
    flex: 1,
    backgroundColor: '#06111F',
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -height * 0.12,
    right: -width * 0.3,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(14, 83, 148, 0.35)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: -height * 0.08,
    left: -width * 0.25,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(242, 140, 40, 0.14)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8,
  },
  carousel: {
    flex: 1,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  brandPillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    marginRight: 8,
  },
  brandPillText: {
    color: '#F8FBFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  skipButtonText: {
    color: '#DCE7F5',
    fontSize: 14,
    fontWeight: '700',
  },
  slide: {
    width,
    flex: 1,
  },
  slideContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#F7FBFF',
    borderRadius: 34,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  heroAura: {
    position: 'absolute',
    top: -48,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.95,
  },
  heroAccentArc: {
    position: 'absolute',
    top: 38,
    right: -36,
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 18,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-16deg' }],
    opacity: 0.95,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  logoShell: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E4F2',
  },
  logoImage: {
    width: '100%',
    height: 220,
  },
  statCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#D8E4F2',
  },
  statLabel: {
    color: '#6B7C93',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  contentBlock: {
    paddingHorizontal: 6,
    paddingTop: 22,
  },
  title: {
    color: '#F8FBFF',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
  },
  description: {
    marginTop: 14,
    color: '#C8D7E8',
    fontSize: 16,
    lineHeight: 25,
  },
  bulletList: {
    marginTop: 20,
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bulletMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 2,
  },
  bulletText: {
    flex: 1,
    color: '#E9F1FA',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 10,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  paginationDot: {
    height: 10,
    borderRadius: 999,
  },
  paginationDotActive: {
    backgroundColor: '#F59E0B',
  },
  paginationDotInactive: {
    backgroundColor: '#4A5C74',
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#03101D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export { ONBOARDING_KEY };
export default OnboardingScreen;

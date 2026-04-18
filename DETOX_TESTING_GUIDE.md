# 🧪 DETOX TESTING GUIDE - UniBuddy Project
## Complete Instructions for All 4 Group Members

---

## 📋 TABLE OF CONTENTS
1. [What is Detox?](#what-is-detox)
2. [Current Setup Status (Already Completed)](#current-setup-status-already-completed)
3. [How Team Members Start and Continue](#how-team-members-start-and-continue)
4. [Each Member's Responsibilities](#each-members-responsibilities)
5. [Step-by-Step: Writing Tests](#step-by-step-writing-tests)
6. [Adding testID to Components](#adding-testid-to-components)
7. [Running Tests](#running-tests)
8. [Git Workflow](#git-workflow)
9. [Presentation Tips](#presentation-tips)

---

## 🎯 What is Detox?

**Detox** is an automated testing tool that:
- ✅ Pretends to be a real user using your app
- ✅ Clicks buttons, types text, fills forms
- ✅ Checks if features work correctly
- ✅ Generates test reports

**Why did we choose Detox?**
- Your assignment requires: "evidence of automated testing tool showing how key features were tested"
- Detox demonstrates actual user interactions with your component
- Shows in Git commits and version control

**Assignment Checklist:**
- ✅ Git - meaningful commits for your component
- ✅ Project Management Tool - tracking your work
- ✅ **Automated Testing Tool - Detox tests (THIS GUIDE)**

---

## ✅ Current Setup Status (Already Completed)

The base Detox setup has already been done and pushed to branch `feature/initial-setup`.

### What was completed
- Installed Detox as a dev dependency in `package.json`
- Updated `package-lock.json`
- Added Detox scripts in `package.json`:
  - `build:e2e:ios`
  - `test:e2e:ios`
- Added Detox configuration block in `package.json`
- Created `e2e/jest.config.js`
- Created `e2e/smoke.e2e.js` (basic launch smoke test)
- Added and pushed this guide file

### Setup commit already on remote
- Branch: `feature/initial-setup`
- Commit: `46b1ba8`

### What this means
- No one needs to recreate the folder or repeat initial Detox setup.
- Each member can start directly from writing tests for their component.

---

## 🚀 How Team Members Start and Continue

Follow these steps exactly.

### Step A: Get setup code locally
```bash
git checkout feature/initial-setup
git pull origin feature/initial-setup
```

### Step B: Install dependencies once
```bash
npm install
```

### Step C: Verify Detox is available
```bash
npx detox --version
```

### Step D: Create your own test file
- Member 1: `e2e/member1-forum.e2e.js`
- Member 2: `e2e/member2-analytics.e2e.js`
- Member 3: `e2e/member3-groups.e2e.js`
- Member 4: `e2e/member4-timetable.e2e.js`

### Step E: Add `testID` values in your screens
Add `testID` props to the exact buttons, inputs, cards, and tabs your test uses.

### Step F: Build and run your tests
```bash
npm run build:e2e:ios
npx detox test e2e/memberX-yourfile.e2e.js -c ios.sim.debug
```

Replace `memberX-yourfile.e2e.js` with your file name.

### Step G: Continue until stable
- Fix failed selectors (`by.id(...)`) by matching real `testID` values.
- Add `waitFor(...).toExist().withTimeout(...)` before tapping dynamic UI.
- Keep tests independent (each test should run even if others fail).

### Step H: Commit only your component work
```bash
git add e2e/memberX-yourfile.e2e.js src/screens/YourScreenFile.tsx
git commit -m "Member X: Add Detox tests for <component name>"
git push
```

### Step I: Before final demo day
- Run all tests together:
```bash
npx detox test e2e -c ios.sim.debug
```
- Take screenshots/videos of passing test output for viva evidence.

---

## 🔧 Setup (ONE PERSON ONLY)

### ⚠️ NOTE
This section is kept for reference only. Initial setup is already done in the repository.

### If you ever need to re-do setup from zero
```bash
cd /Users/dasun/Development/UniBuddy
npm install --save-dev detox
mkdir -p e2e
```

Then ensure these files exist:
- `package.json` includes:
  - `build:e2e:ios`
  - `test:e2e:ios`
  - `detox` config with `ios.sim.debug`
- `e2e/jest.config.js`
- `e2e/smoke.e2e.js`

Then commit and push:
```bash
git add package.json package-lock.json e2e
git commit -m "Setup: Initialize Detox E2E"
git push
```

---

## 👥 Each Member's Responsibilities

### **MEMBER 1: Academic Forum (Q&A)**
- **Component:** `AcademicForumScreen.tsx`
- **Test File:** `e2e/member1-forum.e2e.js`
- **What to Test:**
  - ✅ Post a new question
  - ✅ View questions (filter, sort, upvote/downvote)
  - ✅ Post an answer
  - ✅ Edit own question/answer
  - ✅ Delete own question/answer

### **MEMBER 2: Academic Analytics & Peer Support**
- **Component:** `AcademicDashboardScreen.tsx` + `PeerSupportScreen.tsx`
- **Test File:** `e2e/member2-analytics.e2e.js`
- **What to Test:**
  - ✅ Input grades and calculate GPA
  - ✅ View semester and cumulative GPA
  - ✅ Book a peer tutoring session
  - ✅ View booking history
  - ✅ Reschedule a booking

### **MEMBER 3: Study Groups & Events**
- **Component:** `StudyGroupScreen.tsx` + `CampusEventHubScreen.tsx`
- **Test File:** `e2e/member3-groups.e2e.js`
- **What to Test:**
  - ✅ Create a study group
  - ✅ Search and filter study groups
  - ✅ Join a group (with skill matching)
  - ✅ View upcoming events
  - ✅ Mark as "Going" to an event

### **MEMBER 4: Smart Timetable & Tasks**
- **Component:** `RecoveryPlansScreen.tsx` + task tracker
- **Test File:** `e2e/member4-timetable.e2e.js`
- **What to Test:**
  - ✅ View weekly timetable
  - ✅ Mark a class as missed
  - ✅ Find alternative lecture slot
  - ✅ Add personal study block
  - ✅ View assignment deadlines
  - ✅ Update assignment status

---

## 📝 Step-by-Step: Writing Tests

### **WORKFLOW FOR EACH MEMBER:**

#### **Step 1: Get Latest Code**
```bash
git pull
```

#### **Step 2: Create Your Test File**

**Member 1 Example:** `e2e/member1-forum.e2e.js`

```javascript
describe('MEMBER 1: Academic Forum - Q&A Component', () => {
  
  beforeAll(async () => {
    // Launch the app once before all tests
    await device.launchApp();
  });

  beforeEach(async () => {
    // Reset app state before each test
    await device.reloadReactNative();
  });

  // ========== TEST 1: POST A QUESTION ==========
  it('User can post a new forum question', async () => {
    // Navigate to Forum screen
    await element(by.id('bottomTabBar_Forum')).tap();
    
    // Wait for screen to load
    await waitFor(element(by.id('createQuestionButton'))).toExist().withTimeout(5000);
    
    // Click "Create Question" button
    await element(by.id('createQuestionButton')).tap();
    
    // Verify Question Form is visible
    await expect(element(by.id('questionForm'))).toBeVisible();
    
    // Type question text
    await element(by.id('questionTextInput')).typeText('What is the best way to learn React Native?');
    
    // Add question tag
    await element(by.id('tagInput')).tap();
    await element(by.text('React Native')).tap();
    
    // Submit
    await element(by.id('submitQuestionButton')).multiTap();
    
    // Verify success message
    await expect(element(by.text('Question posted successfully'))).toBeVisible();
  });

  // ========== TEST 2: VIEW QUESTIONS WITH FILTERING ==========
  it('User can view and filter questions by upvotes', async () => {
    await element(by.id('bottomTabBar_Forum')).tap();
    
    // Wait for questions list
    await waitFor(element(by.id('questionsList'))).toExist().withTimeout(5000);
    
    // Click filter button
    await element(by.id('filterButton')).tap();
    
    // Select "Most Upvoted"
    await element(by.text('Most Upvoted')).tap();
    
    // Verify first question is visible (most upvoted)
    await expect(element(by.id('questionCard_0'))).toBeVisible();
  });

  // ========== TEST 3: UPVOTE A QUESTION ==========
  it('User can upvote a question', async () => {
    await element(by.id('bottomTabBar_Forum')).tap();
    
    // Find first question
    await waitFor(element(by.id('questionCard_0'))).toExist().withTimeout(5000);
    
    // Click upvote button
    await element(by.id('upvoteButton_0')).tap();
    
    // Verify upvote count increased
    await expect(element(by.id('upvoteCount_0'))).toHaveToggleValue(true);
  });

  // ========== TEST 4: POST AN ANSWER ==========
  it('User can post an answer to a question', async () => {
    await element(by.id('bottomTabBar_Forum')).tap();
    
    // Click on a question to view details
    await waitFor(element(by.id('questionCard_0'))).toExist().withTimeout(5000);
    await element(by.id('questionCard_0')).tap();
    
    // Verify answer form is visible
    await expect(element(by.id('answerForm'))).toBeVisible();
    
    // Type answer
    await element(by.id('answerTextInput')).typeText('You should start with React documentation and practice with small projects.');
    
    // Submit answer
    await element(by.id('submitAnswerButton')).tap();
    
    // Verify success
    await expect(element(by.text('Answer posted successfully'))).toBeVisible();
  });

  // ========== TEST 5: EDIT OWN QUESTION ==========
  it('User can edit their own question', async () => {
    await element(by.id('bottomTabBar_Forum')).tap();
    
    // Find a question (assuming user's own question has a special indicator)
    await waitFor(element(by.id('myQuestion_0'))).toExist().withTimeout(5000);
    
    // Long press to show options
    await element(by.id('myQuestion_0')).multiTap();
    
    // Click edit
    await element(by.text('Edit')).tap();
    
    // Clear and type new text
    await element(by.id('questionTextInput')).clearText();
    await element(by.id('questionTextInput')).typeText('Updated question text');
    
    // Submit
    await element(by.id('submitQuestionButton')).tap();
    
    // Verify update
    await expect(element(by.text('Question updated successfully'))).toBeVisible();
  });

  // ========== TEST 6: DELETE OWN QUESTION ==========
  it('User can delete their own question', async () => {
    await element(by.id('bottomTabBar_Forum')).tap();
    
    await waitFor(element(by.id('myQuestion_0'))).toExist().withTimeout(5000);
    
    // Long press to show options
    await element(by.id('myQuestion_0')).multiTap();
    
    // Click delete
    await element(by.text('Delete')).tap();
    
    // Confirm deletion
    await element(by.text('Yes, Delete')).tap();
    
    // Verify deletion
    await expect(element(by.text('Question deleted successfully'))).toBeVisible();
  });
});
```

---

#### **Member 2 Example:** `e2e/member2-analytics.e2e.js`

```javascript
describe('MEMBER 2: Academic Analytics & Peer Support', () => {
  
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  // ========== TEST 1: INPUT GRADES AND CALCULATE GPA ==========
  it('User can input grades and view calculated GPA', async () => {
    // Navigate to Dashboard
    await element(by.id('bottomTabBar_Dashboard')).tap();
    
    // Wait for dashboard to load
    await waitFor(element(by.id('addGradeButton'))).toExist().withTimeout(5000);
    
    // Click "Add Grade"
    await element(by.id('addGradeButton')).tap();
    
    // Fill in subject
    await element(by.id('subjectNameInput')).typeText('IT3040 - ITPM');
    
    // Enter grade
    await element(by.id('gradeInput')).typeText('3.8');
    
    // Enter credit hours
    await element(by.id('creditHoursInput')).typeText('3');
    
    // Submit
    await element(by.id('submitGradeButton')).tap();
    
    // Verify success and GPA is displayed
    await expect(element(by.text('Grade added successfully'))).toBeVisible();
    await expect(element(by.id('semesterGPA'))).toBeVisible();
  });

  // ========== TEST 2: VIEW SEMESTER AND CUMULATIVE GPA ==========
  it('User can view semester GPA and CGPA', async () => {
    await element(by.id('bottomTabBar_Dashboard')).tap();
    
    // Wait for GPA display
    await waitFor(element(by.id('semesterGPA'))).toExist().withTimeout(5000);
    
    // Verify semester GPA is visible
    await expect(element(by.id('semesterGPA'))).toBeVisible();
    
    // Verify CGPA is visible
    await expect(element(by.id('cumulativeGPA'))).toBeVisible();
    
    // Verify GPA chart/progress is visible
    await expect(element(by.id('gpaProgressChart'))).toBeVisible();
  });

  // ========== TEST 3: UPDATE A GRADE ==========
  it('User can update a previously entered grade', async () => {
    await element(by.id('bottomTabBar_Dashboard')).tap();
    
    // Wait for grades list
    await waitFor(element(by.id('gradeCard_0'))).toExist().withTimeout(5000);
    
    // Click on a grade to edit
    await element(by.id('gradeCard_0')).multiTap();
    
    // Click edit button
    await element(by.text('Edit')).tap();
    
    // Update grade
    await element(by.id('gradeInput')).clearText();
    await element(by.id('gradeInput')).typeText('4.0');
    
    // Submit
    await element(by.id('submitButton')).tap();
    
    // Verify update
    await expect(element(by.text('Grade updated successfully'))).toBeVisible();
  });

  // ========== TEST 4: BOOK A PEER TUTORING SESSION ==========
  it('User can book a peer tutoring session', async () => {
    // Navigate to Peer Support
    await element(by.id('bottomTabBar_PeerSupport')).tap();
    
    // Wait for page to load
    await waitFor(element(by.id('bookSessionButton'))).toExist().withTimeout(5000);
    
    // Click "Book Session"
    await element(by.id('bookSessionButton')).tap();
    
    // Select a tutor
    await element(by.id('tutorCard_0')).tap();
    
    // Select date
    await element(by.id('datePickerButton')).tap();
    await element(by.text('20')).tap();  // Select 20th
    await element(by.text('Done')).tap();
    
    // Select time
    await element(by.id('timePickerButton')).tap();
    await element(by.text('2:00 PM')).tap();
    await element(by.text('Done')).tap();
    
    // Confirm booking
    await element(by.id('confirmBookingButton')).tap();
    
    // Verify success
    await expect(element(by.text('Session booked successfully'))).toBeVisible();
  });

  // ========== TEST 5: VIEW BOOKING HISTORY ==========
  it('User can view their peer support booking history', async () => {
    await element(by.id('bottomTabBar_PeerSupport')).tap();
    
    // Wait for booking history
    await waitFor(element(by.id('bookingHistoryList'))).toExist().withTimeout(5000);
    
    // Verify bookings are displayed
    await expect(element(by.id('bookingCard_0'))).toBeVisible();
    
    // Verify booking details are shown
    await expect(element(by.id('tutorName_0'))).toBeVisible();
    await expect(element(by.id('sessionDate_0'))).toBeVisible();
  });

  // ========== TEST 6: RESCHEDULE A BOOKING ==========
  it('User can reschedule a peer support session', async () => {
    await element(by.id('bottomTabBar_PeerSupport')).tap();
    
    await waitFor(element(by.id('bookingCard_0'))).toExist().withTimeout(5000);
    
    // Long press to show options
    await element(by.id('bookingCard_0')).multiTap();
    
    // Click reschedule
    await element(by.text('Reschedule')).tap();
    
    // Select new date
    await element(by.id('datePickerButton')).tap();
    await element(by.text('25')).tap();
    await element(by.text('Done')).tap();
    
    // Confirm
    await element(by.id('confirmButton')).tap();
    
    // Verify success
    await expect(element(by.text('Session rescheduled successfully'))).toBeVisible();
  });
});
```

---

#### **Member 3 Example:** `e2e/member3-groups.e2e.js`

```javascript
describe('MEMBER 3: Study Groups & Campus Events', () => {
  
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  // ========== TEST 1: CREATE A STUDY GROUP ==========
  it('User can create a new study group', async () => {
    await element(by.id('bottomTabBar_Groups')).tap();
    
    await waitFor(element(by.id('createGroupButton'))).toExist().withTimeout(5000);
    
    // Click create group
    await element(by.id('createGroupButton')).tap();
    
    // Fill group name
    await element(by.id('groupNameInput')).typeText('React-MERN Stack Project Team');
    
    // Select required skills
    await element(by.id('skillsInput')).tap();
    await element(by.text('React')).tap();
    await element(by.text('Node.js')).tap();
    await element(by.text('MongoDB')).tap();
    
    // Set member limit
    await element(by.id('memberLimitInput')).typeText('4');
    
    // Add description
    await element(by.id('descriptionInput')).typeText('We need to build a full-stack application');
    
    // Create group
    await element(by.id('submitButton')).tap();
    
    // Verify success
    await expect(element(by.text('Study group created successfully'))).toBeVisible();
  });

  // ========== TEST 2: SEARCH AND FILTER STUDY GROUPS ==========
  it('User can search and filter study groups by skills', async () => {
    await element(by.id('bottomTabBar_Groups')).tap();
    
    await waitFor(element(by.id('searchGroupsInput'))).toExist().withTimeout(5000);
    
    // Search for groups
    await element(by.id('searchGroupsInput')).typeText('React');
    
    // Apply filter
    await element(by.id('filterButton')).tap();
    await element(by.text('React')).tap();
    await element(by.text('Apply')).tap();
    
    // Verify filtered results appear
    await expect(element(by.id('groupCard_0'))).toBeVisible();
  });

  // ========== TEST 3: VIEW SKILL MATCH SCORE ==========
  it('User can see skill match percentage when searching groups', async () => {
    await element(by.id('bottomTabBar_Groups')).tap();
    
    await waitFor(element(by.id('searchGroupsInput'))).toExist().withTimeout(5000);
    
    // Search for a group
    await element(by.id('searchGroupsInput')).typeText('ITPM Project');
    
    // Verify match score is visible
    await expect(element(by.id('matchScore_0'))).toBeVisible();
    
    // Verify match score shows percentage
    await expect(element(by.text(/\d+%/))).toBeVisible();
  });

  // ========== TEST 4: JOIN A STUDY GROUP ==========
  it('User can join a study group with matching skills', async () => {
    await element(by.id('bottomTabBar_Groups')).tap();
    
    await waitFor(element(by.id('groupCard_0'))).toExist().withTimeout(5000);
    
    // Click on a group
    await element(by.id('groupCard_0')).tap();
    
    // View group details
    await expect(element(by.id('groupDetailsScreen'))).toBeVisible();
    
    // Click join button
    await element(by.id('joinGroupButton')).tap();
    
    // Verify success
    await expect(element(by.text('You have joined the group'))).toBeVisible();
  });

  // ========== TEST 5: VIEW UPCOMING EVENTS ==========
  it('User can view upcoming campus events', async () => {
    await element(by.id('bottomTabBar_Events')).tap();
    
    await waitFor(element(by.id('eventsList'))).toExist().withTimeout(5000);
    
    // Verify events are displayed
    await expect(element(by.id('eventCard_0'))).toBeVisible();
    
    // Verify event details
    await expect(element(by.id('eventTitle_0'))).toBeVisible();
    await expect(element(by.id('eventDate_0'))).toBeVisible();
    await expect(element(by.id('eventLocation_0'))).toBeVisible();
  });

  // ========== TEST 6: MARK AS "GOING" TO AN EVENT ==========
  it('User can mark themselves as going to an event', async () => {
    await element(by.id('bottomTabBar_Events')).tap();
    
    await waitFor(element(by.id('eventCard_0'))).toExist().withTimeout(5000);
    
    // Click event to view details
    await element(by.id('eventCard_0')).tap();
    
    // Click "Mark as Going"
    await element(by.id('goingButton')).tap();
    
    // Verify success
    await expect(element(by.text('You marked as going to this event'))).toBeVisible();
    
    // Verify button state changed
    await expect(element(by.id('goingButton'))).toHaveToggleValue(true);
  });
});
```

---

#### **Member 4 Example:** `e2e/member4-timetable.e2e.js`

```javascript
describe('MEMBER 4: Smart Timetable & Task Tracker', () => {
  
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  // ========== TEST 1: VIEW WEEKLY TIMETABLE ==========
  it('User can view their weekly timetable', async () => {
    await element(by.id('bottomTabBar_Timetable')).tap();
    
    await waitFor(element(by.id('timetableView'))).toExist().withTimeout(5000);
    
    // Verify timetable is displayed
    await expect(element(by.id('mondayLectures'))).toBeVisible();
    await expect(element(by.id('tuesdayLectures'))).toBeVisible();
    await expect(element(by.id('wednesdayLectures'))).toBeVisible();
    
    // Verify lecture cards are visible
    await expect(element(by.id('lectureCard_0'))).toBeVisible();
  });

  // ========== TEST 2: MARK CLASS AS MISSED & FIND ALTERNATIVE SLOT ==========
  it('Student can mark a class as missed and find alternative slot', async () => {
    await element(by.id('bottomTabBar_Timetable')).tap();
    
    // Wait for timetable
    await waitFor(element(by.id('lectureCard_0'))).toExist().withTimeout(5000);
    
    // Long press on a lecture (e.g., Tuesday lecture)
    await element(by.id('tuesdayLecture')).longPress();
    
    // Select "I will miss this class"
    await element(by.text('I will miss this class')).tap();
    
    // Click "Find Alternative Slot"
    await waitFor(element(by.id('findAlternativeButton'))).toExist().withTimeout(5000);
    await element(by.id('findAlternativeButton')).tap();
    
    // Verify alternative slot suggestions appear (Weekend batch)
    await expect(element(by.id('alternativeSlotsSuggestion'))).toBeVisible();
    await expect(element(by.text('Saturday Alternative Slot'))).toBeVisible();
  });

  // ========== TEST 3: ADD PERSONAL STUDY BLOCK ==========
  it('User can add a personal study block to calendar', async () => {
    await element(by.id('bottomTabBar_Timetable')).tap();
    
    await waitFor(element(by.id('addEventButton'))).toExist().withTimeout(5000);
    
    // Click add event
    await element(by.id('addEventButton')).tap();
    
    // Fill event details
    await element(by.id('eventNameInput')).typeText('Group Study - React');
    
    // Select date
    await element(by.id('datePickerButton')).tap();
    await element(by.text('22')).tap();
    await element(by.text('Done')).tap();
    
    // Select time
    await element(by.id('timePickerButton')).tap();
    await element(by.text('6:00 PM')).tap();
    await element(by.text('Done')).tap();
    
    // Set duration
    await element(by.id('durationInput')).typeText('2');
    
    // Save
    await element(by.id('saveEventButton')).tap();
    
    // Verify success
    await expect(element(by.text('Personal event added successfully'))).toBeVisible();
  });

  // ========== TEST 4: VIEW ASSIGNMENT DEADLINES ==========
  it('User can view all assignment deadlines', async () => {
    await element(by.id('bottomTabBar_Tasks')).tap();
    
    await waitFor(element(by.id('tasksList'))).toExist().withTimeout(5000);
    
    // Verify tasks are displayed
    await expect(element(by.id('assignmentCard_0'))).toBeVisible();
    await expect(element(by.id('assignmentCard_1'))).toBeVisible();
    
    // Verify deadline is visible
    await expect(element(by.id('deadlineDate_0'))).toBeVisible();
    
    // Verify remaining days is shown
    await expect(element(by.text(/\d+ days? remaining/))).toBeVisible();
  });

  // ========== TEST 5: UPDATE ASSIGNMENT STATUS ==========
  it('User can update assignment status from Pending to Submitted', async () => {
    await element(by.id('bottomTabBar_Tasks')).tap();
    
    await waitFor(element(by.id('assignmentCard_0'))).toExist().withTimeout(5000);
    
    // Click on an assignment
    await element(by.id('assignmentCard_0')).tap();
    
    // View assignment details
    await expect(element(by.id('assignmentDetailsScreen'))).toBeVisible();
    
    // Change status dropdown
    await element(by.id('statusDropdown')).tap();
    await element(by.text('Submitted')).tap();
    
    // Save changes
    await element(by.id('saveButton')).tap();
    
    // Verify status changed
    await expect(element(by.text('Status updated to Submitted'))).toBeVisible();
  });

  // ========== TEST 6: SMART REMINDER NOTIFICATIONS ==========
  it('User receives reminder notifications before deadline', async () => {
    await element(by.id('bottomTabBar_Tasks')).tap();
    
    // Navigate to a task with upcoming deadline
    await waitFor(element(by.id('assignmentCard_0'))).toExist().withTimeout(5000);
    
    // Enable notifications in settings
    await element(by.id('settingsButton')).tap();
    await element(by.id('notificationsToggle')).multiTap();
    
    // Return to tasks
    await element(by.id('backButton')).tap();
    
    // Verify notification is shown (7 days before)
    await expect(element(by.text('Reminder: Assignment due in 7 days'))).toBeVisible();
  });
});
```

---

## 🏷️ Adding testID to Components

**This is CRITICAL for tests to work!**

Without `testID`, the test can't find buttons, inputs, or other elements.

### Example 1: Adding testID to a Button

**BEFORE (without testID):**
```jsx
<TouchableOpacity onPress={() => navigation.navigate('CreateQuestion')}>
  <Text>Create Question</Text>
</TouchableOpacity>
```

**AFTER (with testID):**
```jsx
<TouchableOpacity 
  onPress={() => navigation.navigate('CreateQuestion')}
  testID="createQuestionButton"
>
  <Text>Create Question</Text>
</TouchableOpacity>
```

### Example 2: Adding testID to TextInput

**BEFORE:**
```jsx
<TextInput 
  placeholder="Type your question"
  value={question}
  onChangeText={setQuestion}
/>
```

**AFTER:**
```jsx
<TextInput 
  placeholder="Type your question"
  value={question}
  onChangeText={setQuestion}
  testID="questionTextInput"
/>
```

### Example 3: Adding testID to FlatList Items

**BEFORE:**
```jsx
<FlatList
  data={questions}
  renderItem={({ item, index }) => (
    <View>
      <Text>{item.title}</Text>
    </View>
  )}
/>
```

**AFTER:**
```jsx
<FlatList
  data={questions}
  renderItem={({ item, index }) => (
    <View testID={`questionCard_${index}`}>
      <Text>{item.title}</Text>
    </View>
  )}
/>
```

### **Member Responsibilities - Add testID to YOUR components:**

- **Member 1:** Add testID to `src/screens/AcademicForumScreen.tsx` components
- **Member 2:** Add testID to `src/screens/AcademicDashboardScreen.tsx` and `PeerSupportScreen.tsx` components
- **Member 3:** Add testID to `src/screens/StudyGroupScreen.tsx` and `CampusEventHubScreen.tsx` components
- **Member 4:** Add testID to `src/screens/RecoveryPlansScreen.tsx` and task tracking components

---

## ▶️ Running Tests

### **Build the App for Testing**
```bash
cd /Users/dasun/Development/UniBuddy

detox build-framework-cache
detox build-app --configuration ios.sim.debug
```

### **Run Individual Member Tests**

```bash
# Member 1: Forum Tests
detox test e2e/member1-forum.e2e.js --configuration ios.sim.debug

# Member 2: Analytics Tests
detox test e2e/member2-analytics.e2e.js --configuration ios.sim.debug

# Member 3: Groups Tests
detox test e2e/member3-groups.e2e.js --configuration ios.sim.debug

# Member 4: Timetable Tests
detox test e2e/member4-timetable.e2e.js --configuration ios.sim.debug
```

### **Run ALL Tests Together**
```bash
detox test e2e --configuration ios.sim.debug
```

### **Expected Output:**
```
 PASS  e2e/member1-forum.e2e.js (45.2s)
  MEMBER 1: Academic Forum - Q&A Component
    ✓ User can post a new forum question (5.2s)
    ✓ User can view and filter questions by upvotes (3.1s)
    ✓ User can upvote a question (2.5s)
    ✓ User can post an answer to a question (4.8s)
    ✓ User can edit their own question (3.9s)
    ✓ User can delete their own question (2.7s)

 PASS  e2e/member2-analytics.e2e.js (52.1s)
  ... [More tests] ...

 PASS  e2e/member3-groups.e2e.js (48.3s)
  ... [More tests] ...

 PASS  e2e/member4-timetable.e2e.js (50.9s)
  ... [More tests] ...

Test Suites: 4 passed, 4 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        196.5s
```

---

## 📤 Git Workflow

### **Each Member's Git Process:**

```bash
# Step 1: Get latest code
git pull

# Step 2: Create your test file (e.g., member1-forum.e2e.js)
# (Already shown in previous section)

# Step 3: Add testID to your component files
# (Edit your screen files and add testID attributes)

# Step 4: Test locally to make sure it works
detox test e2e/member1-forum.e2e.js --configuration ios.sim.debug

# Step 5: Commit your work
git add e2e/member1-forum.e2e.js
git add src/screens/AcademicForumScreen.tsx  # Your modified screen
git commit -m "Member 1: Added automated E2E tests for forum Q&A component

- Added 6 test cases for question posting, filtering, upvoting
- Added 2 tests for answer posting and management
- Added testID attributes to forum screen components
- Tests verify user journeys for forum component"

# Step 6: Push to remote
git push

# Step 7: Create Pull Request (if your team uses it)
```

### **Sample Commit Message for Members:**

```
Member 1: Added E2E tests for Academic Forum Component

Tests cover:
- Post new question
- View and filter questions
- Upvote/downvote mechanism
- Post answers
- Edit own questions
- Delete own questions

Also added testID values to forum screen components for test identification.

Related to ITPM Assignment 5 - Automated Testing Requirement
```

### **Viewing Git History:**
```bash
git log --oneline
# 7a8b9c0 Member 4: Added E2E tests for timetable and tasks
# 3d4e5f6 Member 3: Added E2E tests for study groups and events
# 1k2l3m4 Member 2: Added E2E tests for analytics and peer support
# 5n6o7p8 Member 1: Added E2E tests for forum Q&A
# 9q0r1s2 Setup: Initialize Detox testing framework
```

---

## 🎤 Presentation Tips

### **What to Show During Viva:**

1. **Show the Test Code**
   - Print or display `e2e/member1-forum.e2e.js` (etc.)
   - Explain: "This test simulates a user posting a question to the forum"

2. **Show Git Commits**
   ```bash
   git log --oneline | head -5
   ```
   - Explain: "Each of us committed our test file separately"

3. **Run Tests Live (or Show Recording)**
   ```bash
   detox test e2e/member1-forum.e2e.js --configuration ios.sim.debug
   ```
   - Show the simulator running automated user interactions
   - Point out: "The app is automatically clicking buttons, typing text, and verifying results"

4. **Show Test Results**
   - Screenshot of "24 Tests Passed" output
   - Explain: "All our tests are passing, which means our features work correctly"

### **What to Say:**

**"We used **Detox**, an automated E2E testing framework, to demonstrate that our components work correctly. Each team member created tests for their specific component:**

- **Member 1** tested the Academic Forum - users can post questions, answers, and participate in voting
- **Member 2** tested Academic Analytics - users can input grades and book peer sessions
- **Member 3** tested Study Groups - users can create and join skill-matched groups
- **Member 4** tested Smart Timetable - users can view schedules and find alternative class slots

**Each test simulates real user interactions and verifies expected outcomes. Our Git history shows meaningful commits for each component's testing code."**

### **Show Git Proof:**
```bash
git log --pretty=format:"%h %s" | grep "Member"
# 7a8b9c0 Member 1: Added E2E tests for forum Q&A
# 1k2l3m4 Member 2: Added E2E tests for analytics
# ... etc
```

---

## 📋 Checklist for Each Member

Before Presentation:

- [ ] Detox setup completed (1 person only)
- [ ] My test file created (`e2e/memberX-*.e2e.js`)
- [ ] testID added to my screen components
- [ ] Tests run successfully locally
- [ ] Committed to Git with meaningful message
- [ ] Git push completed
- [ ] Tests pass in shared environment
- [ ] Screenshot of passing tests taken
- [ ] Git log shows my commits

---

## ⚠️ Common Issues & Fixes

### **Issue 1: "Cannot find element by id"**
**Solution:** Make sure you added `testID="buttonName"` to your component

### **Issue 2: "Timeout waiting for element"**
**Solution:** Increase timeout: `.withTimeout(10000)` instead of 5000

### **Issue 3: "App crashes during test"**
**Solution:** Check if your component has console errors, fix them first

### **Issue 4: "Test file not found"**
**Solution:** Make sure file is in `e2e/` folder with correct name

### **Issue 5: "detox command not found"**
**Solution:** Run `npm install detox-cli --global` again

---

## 📞 Questions?

- Ask in group chat / team meeting
- Check Detox documentation: https://detox.e2e.dev/
- Troubleshoot together during sync-up meetings

---

## 🎯 Summary

| Role | Task | Timeline |
|------|------|----------|
| **Person 1** | Setup Detox + create e2e folder | Day 1 |
| **All Members** | Add testID to components | Day 2 |
| **All Members** | Write tests for your component | Days 3-4 |
| **All Members** | Test locally + commit to Git | Day 5 |
| **All Members** | Prepare presentation + demo | Day 6 |

**Remember:** Each member is responsible for their own component's tests. This shows individual contribution and understanding of testing practices! ✅

---

**Good luck with your ITPM assignment! 🚀**

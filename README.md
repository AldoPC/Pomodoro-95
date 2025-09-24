# Pomodoro 95

A nostalgic Windows 95 style pomodoro timer with a classic segmented progress bar interface.

## Features

- **Classic Windows Aesthetic**: Recreates the look and feel of Windows XP/95 progress dialogs
- **Segmented Progress Bar**: Animated progress bar with the characteristic segmented appearance
- **Customizable Sessions**: Configure work duration, break duration, long break duration, and sessions per cycle
- **Session Tracking**: Visual indicators for current session type and progress
- **Cross-Platform**: Runs on Windows, macOS, and Linux
- **System Integration**: Native desktop app with proper window controls

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

## Usage

### Main Timer Window
- **Start/Pause**: Click the Start button to begin a session, or Pause to pause the current session
- **Reset**: Reset the current session and return to the beginning
- **Settings**: Click the gear icon (⚙️) in the title bar to open settings

### Settings Window
- **Work Duration**: Set the length of work sessions (1-60 minutes)
- **Break Duration**: Set the length of short breaks (1-30 minutes)
- **Long Break Duration**: Set the length of long breaks (1-60 minutes)
- **Sessions per Cycle**: Set how many work sessions before a long break (1-10)

### Session Types
- **Work Sessions**: Green progress bar, focused work time
- **Short Breaks**: Blue progress bar, short rest periods
- **Long Breaks**: Orange progress bar, extended rest after completing a cycle

## Building for Distribution

### Quick Build (Current Platform)
```bash
npm run build
```

### Platform-Specific Builds
```bash
# Build for Windows (creates .exe installer and portable)
npm run build:win

# Build for macOS (creates .dmg and .zip)
npm run build:mac

# Build for Linux (creates AppImage, .deb, and .rpm)
npm run build:linux

# Build for all platforms
npm run build:all
```

### Output Files
The built applications will be in the `dist/` folder:

**Windows:**
- `Pomodoro 95 Setup.exe` - NSIS installer with desktop shortcut
- `Pomodoro 95.exe` - Portable executable (no installation needed)

**macOS:**
- `Pomodoro 95.dmg` - Disk image installer
- `Pomodoro 95.zip` - Archive for distribution

**Linux:**
- `Pomodoro 95.AppImage` - Portable AppImage (runs on any Linux distro)
- `Pomodoro 95.deb` - Debian/Ubuntu package
- `Pomodoro 95.rpm` - Red Hat/Fedora package

### Cross-Platform Building
You can build for any platform from any OS:
- Build Windows apps from macOS/Linux
- Build macOS apps from Windows/Linux (requires macOS for signing)
- Build Linux apps from Windows/macOS

## Technical Details

- **Framework**: Electron
- **Frontend**: HTML, CSS, JavaScript
- **Styling**: Custom CSS recreating Windows XP/95 visual elements
- **Timer Logic**: JavaScript-based with customizable intervals
- **Settings**: Persistent settings storage via Electron IPC

## Customization

The application uses CSS custom properties and classes to handle different session types. You can modify the colors and styling in `styles.css`:

- `.work-session`: Green theme for work sessions
- `.break-session`: Blue theme for short breaks  
- `.long-break-session`: Orange theme for long breaks

## License

MIT License - feel free to modify and distribute as needed.

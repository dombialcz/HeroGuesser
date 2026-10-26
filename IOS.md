# Run Guild of Wits on iPhone

The Xcode project is **ios/App/App.xcodeproj**. It uses Capacitor with Swift Package Manager. Keep editing the existing JavaScript, HTML and CSS; the build bundles them into an installed iPhone app, where Apple's WKWebView runs the game. Small native bridges provide persistent saves, sharing and lifecycle events.

## Start here

From the repository folder, install dependencies once:

```sh
npm ci
```

Build, install and run in the simulator:

```sh
npm run ios:run
```

This rebuilds the game, syncs the iOS project, selects a booted iPhone simulator (or an available iPhone on the newest installed runtime), opens Device Hub on Xcode 27 (Simulator on older Xcode), builds the Release app and launches it. It preserves the installed app's saved progress. No signing team or paid developer membership is needed for this simulator workflow.

To choose a particular simulator:

```sh
npm run ios:run -- --simulator "iPhone 18 Pro"
```

An exact simulator UDID also works. If a name matches multiple runtimes, the command lists the UDIDs so you can choose one.

## Open and run in Xcode

```sh
npm run ios
```

This rebuilds/syncs the game and opens the existing Xcode project. Select scheme **App**, choose an iPhone simulator in the destination selector, then press **⌘R**.

For your real iPhone: connect and trust it, select it as the destination, and choose your Apple ID's development team under **App → Signing & Capabilities**. Then press **⌘R** and complete any device-side developer prompts. The bundle ID is **com.dombialcz.guildofwits**. Paid enrollment/TestFlight are separate publishing steps described in release/PUBLISHING.md.

## Everyday editing loop

1. Edit `src/`, `index.html` or `mastermind.css`. Use `npm run serve` to iterate quickly in a browser.
2. Run **`npm run ios:run`** to see the updated game in Simulator.
3. If working through Xcode or a physical iPhone, run **`npm run ios:sync`**, then **⌘R** in Xcode after web-code changes.

| Command | Purpose |
| --- | --- |
| `npm run ios` | Build, sync and open Xcode |
| `npm run ios:run` | Build, install and launch in Simulator |
| `npm run ios:sync` | Refresh the native app's bundled game files |
| `npm run ios:open` | Open Xcode without rebuilding |
| `npm run ios:test` | Run the native UI test in an automatically selected simulator |

The native UI test resets the simulated game's data before testing background/relaunch persistence and solving. Run/test accept the optional `--simulator` argument.

Build flow: shared game → `dist/` web build → esbuild native entry + `dist-ios/` → Capacitor sync → Xcode → installed app. Core assets/fonts are bundled; no development server is required by the installed app. Avoid editing generated `dist-ios/` or `ios/App/App/public/` files.

Requirements: macOS, Node 22+, Xcode with an installed iOS runtime. The app targets iPhone/iOS 15.4+. The workflow uses your selected Xcode installation; it leaves system Xcode preferences unchanged.

Xcode 27 manages simulator windows through [Device Hub](https://developer.apple.com/documentation/xcode/managing-your-simulated-and-physical-devices-in-device-hub). The runner detects it automatically.

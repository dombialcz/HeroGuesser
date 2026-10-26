import UIKit
import Capacitor

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    // Kept for Capacitor/plugin compatibility; SceneDelegate owns the window.
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool { true }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        (UIApplication.shared.delegate as? AppDelegate)?.window = window
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let context = URLContexts.first else { return }
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: context.url, options: [
            .sourceApplication: context.options.sourceApplication as Any,
            .openInPlace: context.options.openInPlace
        ])
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
}

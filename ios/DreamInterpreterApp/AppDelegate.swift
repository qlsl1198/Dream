import Expo
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?
  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

    // UIKit owns window creation through SceneDelegate, including on iOS 27.
    self.launchOptions = launchOptions

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

// Keep this in the AppDelegate compilation unit so the scene class is included
// in every build without relying on a separate Xcode file-membership entry.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard window == nil,
          let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else { return }

    var options = appDelegate.launchOptions ?? [:]
    if let context = connectionOptions.urlContexts.first {
      options[.url] = context.url
      options[.sourceApplication] = context.options.sourceApplication
      options[.annotation] = context.options.annotation
    }
    if let activity = connectionOptions.userActivities.first {
      options[.userActivityDictionary] = [
        "UIApplicationLaunchOptionsUserActivityKey": activity,
        "UIApplicationLaunchOptionsUserActivityTypeKey": activity.activityType
      ]
    }
    let sceneWindow = UIWindow(windowScene: windowScene)
    window = sceneWindow
    // Expo/RN modules still consult the app delegate's window property.
    appDelegate.window = sceneWindow
    factory.startReactNative(withModuleName: "main", in: sceneWindow, launchOptions: options)
    appDelegate.launchOptions = nil

    // Preserve Expo's subscriber chain as well as React Native's Linking API.
    // Cold-start links arrive here, not in application(_:open:options:).
    deliver(connectionOptions.urlContexts)
    for activity in connectionOptions.userActivities {
      deliver(activity)
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    deliver(URLContexts)
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    deliver(userActivity)
  }

  private func deliver(_ contexts: Set<UIOpenURLContext>) {
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    for context in contexts {
      var options: [UIApplication.OpenURLOptionsKey: Any] = [
        .openInPlace: context.options.openInPlace
      ]
      options[.sourceApplication] = context.options.sourceApplication
      options[.annotation] = context.options.annotation
      _ = appDelegate.application(UIApplication.shared, open: context.url, options: options)
    }
  }

  private func deliver(_ activity: NSUserActivity) {
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    _ = appDelegate.application(
      UIApplication.shared, continue: activity, restorationHandler: { _ in })
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

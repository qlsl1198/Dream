// Structural regression checks; these do not replace an iOS 27 launch test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const appConfig = JSON.parse(read('app.json'));
const plist = JSON.parse(execFileSync('/usr/bin/plutil', [
  '-convert', 'json', '-o', '-', path.join(root, 'ios/DreamInterpreterApp/Info.plist'),
], { encoding: 'utf8' }));
const manifest = plist.UIApplicationSceneManifest;
assert.deepEqual(manifest, appConfig.expo.ios.infoPlist.UIApplicationSceneManifest,
  'native and Expo scene manifests must agree');
assert.equal(manifest.UIApplicationSupportsMultipleScenes, false);
assert.equal(manifest.UISceneConfigurations.UIWindowSceneSessionRoleApplication[0].UISceneDelegateClassName,
  '$(PRODUCT_MODULE_NAME).SceneDelegate');
const swift = read('ios/DreamInterpreterApp/AppDelegate.swift');
const sceneStart = swift.indexOf('class SceneDelegate:');
assert.ok(sceneStart > 0, 'SceneDelegate must be compiled in the existing AppDelegate source');
assert.match(swift, /class SceneDelegate: UIResponder, UIWindowSceneDelegate/);
assert.doesNotMatch(swift.substring(0, sceneStart), /UIWindow\(frame:|\.startReactNative\(/,
  'AppDelegate must not start an unattached legacy window');
assert.equal((swift.match(/\.startReactNative\(/g) || []).length, 1,
  'only one React Native startup path is allowed');
assert.match(swift, /guard window == nil/);
assert.match(swift, /UIWindow\(windowScene: windowScene\)/);
assert.match(swift, /appDelegate\.window = sceneWindow/);
assert.match(swift, /in: sceneWindow, launchOptions: options/);
assert.match(swift, /options\[\.url\] = context\.url/);
assert.match(swift, /options\[\.userActivityDictionary\]/);
assert.match(swift, /openURLContexts URLContexts: Set<UIOpenURLContext>/);
assert.match(swift, /appDelegate\.application\(UIApplication\.shared, open: context\.url/);
assert.match(swift, /UIApplication\.shared, continue: activity/);
const launchStoryboard = read('ios/DreamInterpreterApp/SplashScreen.storyboard');
assert.doesNotMatch(launchStoryboard, /<imageView\b|<image\b/,
  'launch screen must not flash the legacy square image');
assert.equal(appConfig.expo.splash.image, undefined);
assert.equal(appConfig.expo.splash.backgroundColor, '#0B1426');
const launchColor = JSON.parse(read('ios/DreamInterpreterApp/Images.xcassets/SplashScreenBackground.colorset/Contents.json'));
const components = launchColor.colors[0].color.components;
for (const [name, value] of Object.entries({ red: 11, green: 20, blue: 38 })) {
  assert.ok(Math.abs(Number(components[name]) * 255 - value) < 0.001,
    `native launch ${name} must match Expo background`);
}
assert.match(swift, /rootViewController\?\.view.backgroundColor = launchBackground/);
console.log('PASS: iOS scene lifecycle, cold/warm linking, matching image-free launch background');

// macOS-only deterministic artwork compositor. Never redraws app UI.
// Usage: swift scripts/render-store-art.swift <capture-dir> <output-dir> <iphone|ipad> [web-preview]
import AppKit
import Foundation

struct Slide {
  let file: String
  let title: String
  let subtitle: String
  let art: String
}
let slides = [
  Slide(file: "01-home", title: "어젯밤의 꿈이\n나만의 이야기가 돼요", subtitle: "몽이와 함께 남기는 나만의 꿈 기록", art: "mongi"),
  Slide(file: "02-album", title: "밤마다 쌓이는\n나만의 꿈 앨범", subtitle: "기록하고, 찾고, 다시 꺼내보세요", art: "moon-lake"),
  Slide(file: "03-dictionary", title: "꿈속 단서를\n한 장씩 펼쳐보세요", subtitle: "28개의 상징, 나를 돌아보는 작은 힌트", art: "symbol-book"),
  Slide(file: "04-journey", title: "쌓인 꿈 속에서\n나의 마음을 만나요", subtitle: "기록과 감정을 천천히 돌아보는 시간", art: "mongi")
]
func color(_ hex: UInt32, _ alpha: CGFloat = 1) -> NSColor {
  NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255,
          green: CGFloat((hex >> 8) & 255) / 255,
          blue: CGFloat(hex & 255) / 255, alpha: alpha)
}
func fail(_ message: String) -> Never {
  FileHandle.standardError.write(Data((message + "\n").utf8)); exit(1)
}
guard (4...5).contains(CommandLine.arguments.count) else { fail("Expected capture-dir output-dir iphone|ipad [web-preview]") }
let preview = CommandLine.arguments.count == 5
if preview && CommandLine.arguments[4] != "web-preview" { fail("Unknown mode") }
let input = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let output = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
let device = CommandLine.arguments[3]
guard ["iphone", "ipad"].contains(device) else { fail("Unknown device") }
let tablet = device == "ipad"
let width = tablet ? 2064 : 1206
let height = tablet ? 2752 : 2622
let w = CGFloat(width), h = CGFloat(height)
let project = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let assetDir = project.appendingPathComponent("assets/dream-world")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
for slide in slides {
  let destination = output.appendingPathComponent(slide.file + ".png")
  guard !FileManager.default.fileExists(atPath: destination.path) else { fail("Refusing overwrite: \(destination.path)") }
  guard let image = NSImage(contentsOf: input.appendingPathComponent(slide.file + ".png")) else {
    fail("Missing native capture: \(slide.file).png")
  }
  var imageRect = NSRect(origin: .zero, size: image.size)
  guard let source = image.cgImage(forProposedRect: &imageRect, context: nil, hints: nil) else { fail("Invalid source") }
  let ratio = CGFloat(source.width) / CGFloat(source.height)
  guard tablet ? (ratio > 0.7 && ratio < 0.8) : (ratio > 0.43 && ratio < 0.49) else {
    fail("Unexpected native capture aspect ratio for \(device): \(source.width)x\(source.height)")
  }
  guard let ctx = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8,
                           bytesPerRow: width * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
                           bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { fail("Cannot allocate output") }
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(cgContext: ctx, flipped: false)
  let bounds = NSRect(x: 0, y: 0, width: w, height: h)
  NSGradient(starting: color(0x162440), ending: color(0x080F1D))!.draw(in: bounds, angle: 90)
  let gold = color(0xE8CE96), cream = color(0xF7F1E5)
  func text(_ string: String, top: CGFloat, size: CGFloat, weight: NSFont.Weight,
            tint: NSColor, maxWidth: CGFloat, x: CGFloat) {
    let style = NSMutableParagraphStyle()
    style.lineSpacing = size * 0.12
    style.lineBreakMode = .byWordWrapping
    let font = NSFont(name: weight == .bold ? "AppleSDGothicNeo-Bold" : "AppleSDGothicNeo-Regular", size: size)
      ?? NSFont.systemFont(ofSize: size, weight: weight)
    let value = NSAttributedString(string: string, attributes: [.font: font, .foregroundColor: tint, .paragraphStyle: style])
    let measured = value.boundingRect(with: NSSize(width: maxWidth, height: 600), options: [.usesLineFragmentOrigin, .usesFontLeading])
    value.draw(with: NSRect(x: x, y: h - top - ceil(measured.height), width: maxWidth, height: ceil(measured.height)),
               options: [.usesLineFragmentOrigin, .usesFontLeading])
  }
  let margin: CGFloat = tablet ? 150 : 92
  text("드림로그", top: 115, size: tablet ? 42 : 34, weight: .bold, tint: gold, maxWidth: w - 2 * margin, x: margin)
  if !tablet, let mascot = NSImage(contentsOf: assetDir.appendingPathComponent("mongi.png")) {
    mascot.draw(in: NSRect(x: w - margin - 145, y: h - 190, width: 145, height: 145),
                from: .zero, operation: .sourceOver, fraction: 1, respectFlipped: false, hints: nil)
  }
  text(slide.title, top: tablet ? 210 : 205, size: tablet ? 105 : 83,
       weight: .bold, tint: cream, maxWidth: w - 2 * margin, x: margin)
  text(slide.subtitle, top: tablet ? 495 : 440, size: tablet ? 40 : 34,
       weight: .regular, tint: color(0xB5C0D2), maxWidth: w - 2 * margin, x: margin)

  // Native UI is uniformly scaled, fully visible, and never masked by decoration.
  let top: CGFloat = tablet ? 700 : 590
  let bottom: CGFloat = 125
  let maxHeight = h - top - bottom
  let maxWidth = w - 2 * margin
  let screenWidth = min(maxWidth, maxHeight * ratio)
  let screenHeight = screenWidth / ratio
  let screen = NSRect(x: (w - screenWidth) / 2, y: h - top - screenHeight,
                      width: screenWidth, height: screenHeight)
  let outline = NSBezierPath(roundedRect: screen.insetBy(dx: -3, dy: -3), xRadius: 25, yRadius: 25)
  color(0xE8CE96, 0.5).setStroke(); outline.lineWidth = 3; outline.stroke()
  ctx.interpolationQuality = .high
  ctx.draw(source, in: screen)

  // Decorations remain outside the native screen rectangle.
  if tablet, let art = NSImage(contentsOf: assetDir.appendingPathComponent(slide.art + ".png")) {
    art.draw(in: NSRect(x: w - 420, y: h - 600, width: 260, height: 260),
             from: .zero, operation: .sourceOver, fraction: 0.8, respectFlipped: false, hints: nil)
  }
  text(preview ? "웹 미리보기 기반 디자인 · 스토어 등록 전 iOS 캡처 교체" : "꿈을 기록하고, 나를 돌아보는 시간", top: h - 75, size: tablet ? 30 : 24,
       weight: .regular, tint: color(0x8191AA), maxWidth: w - 2 * margin, x: margin)
  NSGraphicsContext.restoreGraphicsState()
  guard let result = ctx.makeImage(), let data = NSBitmapImageRep(cgImage: result).representation(using: .png, properties: [:]) else {
    fail("Cannot encode PNG")
  }
  try data.write(to: destination, options: .withoutOverwriting)
  print("\(destination.path) \(width)x\(height) source=\(preview ? "web-preview" : "native") \(source.width)x\(source.height)")
}

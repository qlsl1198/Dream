// Mechanical size/format preparation for previously generated marketing artwork.
// Usage: swift scripts/format-store-creative.swift input.png output.png width height
import AppKit
import Foundation
let args = CommandLine.arguments
guard args.count == 5, let width = Int(args[3]), let height = Int(args[4]),
      width > 0, height > 0, width <= 6000, height <= 6000 else { fatalError("Expected input output width height") }
guard !FileManager.default.fileExists(atPath: args[2]), let image = NSImage(contentsOfFile: args[1]) else {
  fatalError("Missing source or destination already exists")
}
var sourceRect = NSRect(origin: .zero, size: image.size)
guard let source = image.cgImage(forProposedRect: &sourceRect, context: nil, hints: nil),
      let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8,
                             bytesPerRow: width * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!,
                             bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { fatalError("Cannot render") }
context.setFillColor(CGColor(srgbRed: 11/255, green: 20/255, blue: 38/255, alpha: 1))
context.fill(CGRect(x: 0, y: 0, width: width, height: height))
let scale = max(CGFloat(width) / CGFloat(source.width), CGFloat(height) / CGFloat(source.height))
let targetWidth = CGFloat(source.width) * scale, targetHeight = CGFloat(source.height) * scale
context.interpolationQuality = .high
context.draw(source, in: CGRect(x: (CGFloat(width) - targetWidth) / 2,
                                y: (CGFloat(height) - targetHeight) / 2, width: targetWidth, height: targetHeight))
guard let result = context.makeImage(), let data = NSBitmapImageRep(cgImage: result).representation(using: .png, properties: [:]) else {
  fatalError("Cannot encode PNG")
}
try data.write(to: URL(fileURLWithPath: args[2]), options: .withoutOverwriting)
print("\(args[2]) \(width)x\(height) opaque sRGB")

import AppKit
import ImageIO
let context = CGContext(data: nil, width: 1024, height: 1024, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
context.setFillColor(CGColor(red: 0.055, green: 0.10, blue: 0.13, alpha: 1))
context.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
context.setStrokeColor(CGColor(red: 0.83, green: 0.69, blue: 0.42, alpha: 1)); context.setLineWidth(14)
context.addPath(CGPath(roundedRect: CGRect(x: 60, y: 60, width: 904, height: 904), cornerWidth: 96, cornerHeight: 96, transform: nil)); context.strokePath()
let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: "art-source/thief.png") as CFURL, nil)!
context.draw(CGImageSourceCreateImageAtIndex(source, 0, nil)!, in: CGRect(x: 112, y: 112, width: 800, height: 800))
let url = URL(fileURLWithPath: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")
let output = CGImageDestinationCreateWithURL(url as CFURL, "public.png" as CFString, 1, nil)!
CGImageDestinationAddImage(output, context.makeImage()!, nil)
assert(CGImageDestinationFinalize(output))

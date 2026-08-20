import Cocoa
import Vision

guard CommandLine.arguments.count > 1 else { exit(1) }
let path = CommandLine.arguments[1]
let url = URL(fileURLWithPath: path)
guard let img = NSImage(contentsOf: url),
      let cgImg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    exit(1)
}

let req = VNRecognizeTextRequest { (request, error) in
    guard let results = request.results as? [VNRecognizedTextObservation] else { return }
    for obs in results {
        if let top = obs.topCandidates(1).first {
            print(top.string)
        }
    }
}
req.recognitionLanguages = ["zh-Hant", "zh-Hans", "en-US"]
req.recognitionLevel = .accurate

let handler = VNImageRequestHandler(cgImage: cgImg, options: [:])
try? handler.perform([req])

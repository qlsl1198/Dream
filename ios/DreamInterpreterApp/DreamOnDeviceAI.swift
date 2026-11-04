import Foundation
import FoundationModels
import React

/// SystemLanguageModel.default performs inference on the device.
@objc(DreamOnDeviceAI)
final class DreamOnDeviceAI: NSObject {
  private var generation: Task<Void, Never>?
  @objc static func requiresMainQueueSetup() -> Bool { false }
  @objc var methodQueue: DispatchQueue { DispatchQueue.main }

  @objc(status:rejecter:)
  func status(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 26.0, *) else {
      resolve(["available": false, "message": "온디바이스 AI는 iOS 26 이상에서 지원됩니다. 기본 해석을 사용할 수 있어요."])
      return
    }
    switch SystemLanguageModel.default.availability {
    case .available:
      resolve(["available": true, "message": "온디바이스 AI 준비됨 · 외부 전송 없음"])
    case .unavailable(.appleIntelligenceNotEnabled):
      resolve(["available": false, "message": "설정에서 Apple Intelligence를 켜면 AI를 사용할 수 있어요. 지금은 기본 해석을 제공합니다."])
    case .unavailable(.modelNotReady):
      resolve(["available": false, "message": "Apple Intelligence 모델 준비 중입니다. 지금은 기본 해석을 제공합니다."])
    default:
      resolve(["available": false, "message": "이 기기는 온디바이스 AI를 사용할 수 없어 기본 해석을 제공합니다."])
    }
  }

  @objc(generate:prompt:resolver:rejecter:)
  func generate(_ instructions: String, prompt: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard #available(iOS 26.0, *), SystemLanguageModel.default.isAvailable else {
      reject("AI_UNAVAILABLE", "온디바이스 AI를 사용할 수 없습니다.", nil)
      return
    }
    guard generation == nil else {
      reject("AI_BUSY", "이미 해석 중입니다.", nil)
      return
    }
    generation = Task { @MainActor in
      defer { self.generation = nil }
      do {
        let session = LanguageModelSession(instructions: instructions)
        let response = try await session.respond(to: prompt, options: GenerationOptions(temperature: 0.6, maximumResponseTokens: 1000))
        try Task.checkCancellation()
        resolve(response.content)
      } catch {
        reject("AI_GENERATION_FAILED", "기기 내 AI 해석을 완료하지 못했습니다. 기본 해석을 제공합니다.", nil)
      }
    }
  }

  @objc func cancel() { generation?.cancel() }
}

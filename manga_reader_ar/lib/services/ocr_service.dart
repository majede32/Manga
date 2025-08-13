import 'dart:ui' show Rect;
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import '../models/ocr_models.dart';

class OcrService {
	final TextRecognizer _textRecognizer;

	OcrService._(this._textRecognizer);

	factory OcrService.forJapanese() {
		return OcrService._(
			TextRecognizer(script: TextRecognitionScript.japanese),
		);
	}

	factory OcrService.forLatin() {
		return OcrService._(
			TextRecognizer(script: TextRecognitionScript.latin),
		);
	}

	Future<RecognizedText> recognizeFromFile(String imagePath) async {
		final inputImage = InputImage.fromFilePath(imagePath);
		return _textRecognizer.processImage(inputImage);
	}

	/// Returns detected line regions with normalized rectangles and text.
	Future<List<DetectedTextRegion>> detectRegions(String imagePath, {required int imageWidth, required int imageHeight}) async {
		final recognized = await recognizeFromFile(imagePath);
		final regions = <DetectedTextRegion>[];
		for (final block in recognized.blocks) {
			for (final line in block.lines) {
				final rect = line.boundingBox;
				final norm = Rect.fromLTWH(
					(rect.left / imageWidth).clamp(0.0, 1.0),
					(rect.top / imageHeight).clamp(0.0, 1.0),
					(rect.width / imageWidth).clamp(0.0, 1.0),
					(rect.height / imageHeight).clamp(0.0, 1.0),
				);
				regions.add(DetectedTextRegion(text: line.text, normalizedRect: norm));
			}
		}
		return regions;
	}

	Future<void> dispose() async {
		await _textRecognizer.close();
	}
}
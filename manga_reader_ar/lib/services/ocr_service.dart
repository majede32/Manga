import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

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

	Future<void> dispose() async {
		await _textRecognizer.close();
	}
}
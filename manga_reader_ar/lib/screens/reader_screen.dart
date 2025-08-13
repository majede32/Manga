import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import '../services/ocr_service.dart';
import '../services/translation_service.dart';

class ReaderScreen extends StatefulWidget {
	const ReaderScreen({super.key});

	@override
	State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
	final ImagePicker _picker = ImagePicker();
	String? _pickedPath;
	String? _ocrText;
	String? _translated;

	Future<void> _pickAndTranslate() async {
		setState(() {
			_ocrText = null;
			_translated = null;
		});
		final XFile? file = await _picker.pickImage(source: ImageSource.gallery);
		if (file == null) return;
		_pickedPath = file.path;
		EasyLoading.show(status: 'جاري التعرف على النص...');
		final ocr = OcrService.forJapanese();
		try {
			final res = await ocr.recognizeFromFile(_pickedPath!);
			_ocrText = res.text.trim();
		} finally {
			await ocr.dispose();
		}
		EasyLoading.show(status: 'جاري الترجمة إلى العربية...');
		await Future.delayed(const Duration(milliseconds: 200));
		await Future(() async {
			_translated = await TranslationService.translateToArabic(_ocrText ?? '');
		});
		EasyLoading.dismiss();
		setState(() {});
	}

	@override
	Widget build(BuildContext context) {
		return Scaffold(
			appBar: AppBar(
				title: const Text('قارئ وترجمة مانجا'),
				actions: [
					IconButton(
						icon: const Icon(Icons.image),
						onPressed: _pickAndTranslate,
					),
				],
			),
			body: Padding(
				padding: const EdgeInsets.all(12),
				child: SingleChildScrollView(
					child: Column(
						crossAxisAlignment: CrossAxisAlignment.stretch,
						children: [
							if (_pickedPath != null)
								ClipRRect(
									borderRadius: BorderRadius.circular(8),
									child: Image.file(File(_pickedPath!)),
								),
							const SizedBox(height: 16),
							if (_ocrText != null) ...[
								Text('النص المستخرج:', style: Theme.of(context).textTheme.titleMedium),
								const SizedBox(height: 8),
								Container(
									padding: const EdgeInsets.all(12),
									decoration: BoxDecoration(
										color: Colors.white10,
										borderRadius: BorderRadius.circular(8),
									),
									child: Text(_ocrText!),
								),
							],
							const SizedBox(height: 16),
							if (_translated != null) ...[
								Text('الترجمة العربية:', style: Theme.of(context).textTheme.titleMedium),
								const SizedBox(height: 8),
								Container(
									padding: const EdgeInsets.all(12),
									decoration: BoxDecoration(
										color: Colors.white10,
										borderRadius: BorderRadius.circular(8),
									),
									child: Text(_translated!, textDirection: TextDirection.rtl),
								),
							],
						],
					),
				),
			),
		);
	}
}
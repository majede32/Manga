import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:http/http.dart' as http;
import '../services/ocr_service.dart';
import '../services/translation_service.dart';
import '../services/storage_service.dart';
import '../models/ocr_models.dart';
import '../widgets/overlay_painter.dart';

class ReaderScreen extends StatefulWidget {
	const ReaderScreen({super.key});

	@override
	State<ReaderScreen> createState() => _ReaderScreenState();
}

class _ReaderScreenState extends State<ReaderScreen> {
	final ImagePicker _picker = ImagePicker();
	String? _pickedPath;
	Uint8List? _remoteBytes;
	Size? _imageSize;
	List<DetectedTextRegion> _regions = [];
	Map<int, String> _translations = {};
	String _dialect = 'الفصحى';

	Future<void> _pickLocalAndProcess() async {
		setState(() {
			_regions = [];
			_translations = {};
			_remoteBytes = null;
		});
		final XFile? file = await _picker.pickImage(source: ImageSource.gallery);
		if (file == null) return;
		_pickedPath = file.path;
		final decoded = await decodeImageFromList(await File(_pickedPath!).readAsBytes());
		_imageSize = Size(decoded.width.toDouble(), decoded.height.toDouble());
		await _runOcrAndOverlay(sourcePath: _pickedPath!, w: decoded.width, h: decoded.height);
	}

	Future<void> _importFromUrl() async {
		final controller = TextEditingController();
		final url = await showDialog<String>(context: context, builder: (ctx) {
			return AlertDialog(
				title: const Text('استيراد صفحة مانجا من رابط'),
				content: TextField(controller: controller, decoration: const InputDecoration(hintText: 'https://...jpg|png')), 
				actions: [
					TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
					TextButton(onPressed: () => Navigator.pop(ctx, controller.text.trim()), child: const Text('جلب')),
				],
			);
		});
		if (url == null || url.isEmpty) return;
		EasyLoading.show(status: 'جاري التحميل...');
		final res = await http.get(Uri.parse(url));
		if (res.statusCode != 200) {
			EasyLoading.dismiss();
			ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('فشل التحميل')));
			return;
		}
		_remoteBytes = res.bodyBytes;
		final decoded = await decodeImageFromList(_remoteBytes!);
		_imageSize = Size(decoded.width.toDouble(), decoded.height.toDouble());
		EasyLoading.dismiss();
		// حفظ محلياً
		await StorageService.savePage(key: url, bytes: _remoteBytes!);
		await _runOcrAndOverlay(remoteKey: url, w: decoded.width, h: decoded.height);
	}

	Future<void> _runOcrAndOverlay({String? sourcePath, String? remoteKey, required int w, required int h}) async {
		EasyLoading.show(status: 'OCR...');
		final ocr = OcrService.forJapanese();
		try {
			if (sourcePath != null) {
				_regions = await ocr.detectRegions(sourcePath, imageWidth: w, imageHeight: h);
			} else if (remoteKey != null && _remoteBytes != null) {
				// حفظ bytes لملف مؤقت للتوافق مع MLKit
				final tmp = File('${Directory.systemTemp.path}/manga_tmp_${DateTime.now().microsecondsSinceEpoch}.png');
				await tmp.writeAsBytes(_remoteBytes!);
				_regions = await ocr.detectRegions(tmp.path, imageWidth: w, imageHeight: h);
			}
		} finally {
			await ocr.dispose();
		}
		EasyLoading.dismiss();
		setState(() {});
	}

	Future<void> _translateAll() async {
		if (_regions.isEmpty) return;
		EasyLoading.show(status: 'جاري الترجمة...');
		final texts = _regions.map((e) => e.text).toList();
		final translated = await TranslationService.translateBatch(texts, dialect: _dialect);
		_translations = {
			for (int i = 0; i < translated.length && i < _regions.length; i++) i: translated[i]
		};
		EasyLoading.dismiss();
		setState(() {});
	}

	Future<void> _listOffline() async {
		final keys = await StorageService.listSavedKeys();
		showModalBottomSheet(context: context, builder: (ctx) {
			return ListView(
				children: [
					for (final k in keys)
						ListTile(
							title: Text(k, maxLines: 1, overflow: TextOverflow.ellipsis, textDirection: TextDirection.ltr),
							onTap: () async {
								final bytes = StorageService.getPage(k);
								if (bytes == null) return;
								_remoteBytes = bytes;
								final decoded = await decodeImageFromList(bytes);
								_imageSize = Size(decoded.width.toDouble(), decoded.height.toDouble());
								Navigator.pop(ctx);
								setState(() {
									_regions = [];
									_translations = {};
								});
							},
						),
				],
			);
		});
	}

	@override
	Widget build(BuildContext context) {
		final hasImage = _pickedPath != null || _remoteBytes != null;
		return Scaffold(
			appBar: AppBar(
				title: const Text('قارئ وترجمة مانجا'),
				actions: [
					PopupMenuButton<String>(
						initialValue: _dialect,
						onSelected: (v) => setState(() => _dialect = v),
						itemBuilder: (ctx) => [
							for (final d in TranslationService.supportedDialects)
								PopupMenuItem<String>(value: d, child: Text('لهجة: $d')),
						],
					),
					IconButton(icon: const Icon(Icons.cloud_download), onPressed: _importFromUrl),
					IconButton(icon: const Icon(Icons.image), onPressed: _pickLocalAndProcess),
					IconButton(icon: const Icon(Icons.translate), onPressed: _translateAll),
					IconButton(icon: const Icon(Icons.save_alt), onPressed: _listOffline),
				],
			),
			body: Padding(
				padding: const EdgeInsets.all(12),
				child: hasImage
					? LayoutBuilder(builder: (ctx, constraints) {
						final display = _imageSize ?? const Size(1, 1);
						return Center(
							child: AspectRatio(
								aspectRatio: display.width / display.height,
								child: Stack(
									fit: StackFit.expand,
									children: [
										if (_pickedPath != null)
											Image.file(File(_pickedPath!), fit: BoxFit.contain),
										if (_remoteBytes != null)
											Image.memory(_remoteBytes!, fit: BoxFit.contain),
										IgnorePointer(
											child: CustomPaint(
												painter: TextRegionsOverlayPainter(
													regions: _regions,
													imageSize: display,
													translatedByIndex: _translations,
												),
											),
										),
									],
								),
							),
						);
					})
					: const Center(child: Text('اختر صورة أو استورد رابط صفحة مانجا')),
			),
		);
	}
}
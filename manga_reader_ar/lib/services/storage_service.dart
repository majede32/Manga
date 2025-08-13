import 'dart:typed_data';
import 'package:hive_flutter/hive_flutter.dart';

class StorageService {
	static const String pagesBoxName = 'offline_pages';
	static const String metaBoxName = 'offline_meta';

	static Future<void> init() async {
		await Hive.initFlutter();
		await Hive.openBox<Uint8List>(pagesBoxName);
		await Hive.openBox(metaBoxName);
	}

	static Future<void> savePage({required String key, required Uint8List bytes}) async {
		final box = Hive.box<Uint8List>(pagesBoxName);
		await box.put(key, bytes);
	}

	static Uint8List? getPage(String key) {
		final box = Hive.box<Uint8List>(pagesBoxName);
		return box.get(key);
	}

	static Future<void> saveMeta(String key, Map<String, dynamic> meta) async {
		final box = Hive.box(metaBoxName);
		await box.put(key, meta);
	}

	static Map<String, dynamic>? getMeta(String key) {
		final box = Hive.box(metaBoxName);
		final v = box.get(key);
		if (v is Map) return Map<String, dynamic>.from(v);
		return null;
	}

	static Future<List<String>> listSavedKeys() async {
		final box = Hive.box<Uint8List>(pagesBoxName);
		return box.keys.map((e) => e.toString()).toList();
	}
}
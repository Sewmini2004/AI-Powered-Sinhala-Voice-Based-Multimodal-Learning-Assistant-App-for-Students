import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import TextRecognition from 'react-native-text-recognition';

export default function ImageToTextScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [scannedText, setScannedText] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const router = useRouter();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'You must allow media access to pick an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      extractTextFromImage(result.assets[0].uri);
    }
  };

  const extractTextFromImage = async (uri: string) => {
    try {
      const result = await TextRecognition.recognize(uri);
      setScannedText(result.join('\n'));
    } catch (error) {
      console.error('OCR error:', error);
      Alert.alert('Error', 'Could not scan text from image.');
    }
  };

  const saveNote = () => {
    if (scannedText.trim()) {
      setSavedNotes([...savedNotes, scannedText]);
      setScannedText('');
      Alert.alert('Saved', 'Note has been saved.');
    } else {
      Alert.alert('Empty Text', 'No text to save.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🖼️ Image to Text</Text>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose Image</Text>
      </TouchableOpacity>

      {image && (
        <>
          <Image source={{ uri: image }} style={styles.image} />
        </>
      )}

      {scannedText ? (
        <>
          <TextInput
            style={styles.notepad}
            multiline
            value={scannedText}
            onChangeText={setScannedText}
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
            <Text style={styles.buttonText}>Save Note</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <View style={styles.savedNotesContainer}>
        <Text style={styles.savedNotesTitle}>📒 Saved Notes:</Text>
        {savedNotes.length > 0 ? (
          savedNotes.map((note, index) => (
            <Text key={index} style={styles.savedNote}>
              {index + 1}. {note}
            </Text>
          ))
        ) : (
          <Text style={styles.noSavedNotes}>No notes saved yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#4e73df',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    marginVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  notepad: {
    width: '100%',
    minHeight: 150,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  savedNotesContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  savedNotesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  savedNote: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  noSavedNotes: {
    fontSize: 16,
    color: '#999',
  },
});
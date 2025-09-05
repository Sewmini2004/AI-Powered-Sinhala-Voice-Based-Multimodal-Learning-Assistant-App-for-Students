import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BACKEND_URL = 'http://192.168.43.114:3000';
const USER_ID = 1; // You should manage this state globally in a real app

interface Note { 
  id: number;
  content: string;
  filePath: string;
  createdAt: string;
  type: 'text_to_speech' | 'voice_to_text' | 'image_to_text';
}

export default function SavedNotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchNotes();
  }, [filterType, searchText]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      let url = `${BACKEND_URL}/notes/${USER_ID}`;
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (searchText) {
        params.append('search', searchText);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async () => {
    if (selectedNoteId === null) {
      Alert.alert('Warning', 'Please select a note to delete.');
      return;
    }
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/notes/${selectedNoteId}`, {
                method: 'DELETE',
              });
              if (!response.ok) {
                throw new Error('Failed to delete note');
              }
              Alert.alert('Success', 'Note deleted successfully.');
              setSelectedNoteId(null);
              fetchNotes(); // Refresh the list
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNotePress = (noteId: number) => {
    setSelectedNoteId(noteId === selectedNoteId ? null : noteId);
  };

  const getNoteColor = (type: string) => {
    switch (type) {
      case 'text_to_speech':
        return '#e6f0ff';
      case 'voice_to_text':
        return '#e6ffe6';
      case 'image_to_text':
        return '#fff0e6';
      default:
        return '#f9f9f9';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📑 Saved Notes</Text>

      {/* <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search notes..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <Picker
          selectedValue={filterType}
          onValueChange={(itemValue) => setFilterType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All Types" value="all" />
          <Picker.Item label="Text-to-Speech" value="text_to_speech" />
          <Picker.Item label="Voice-to-Text" value="voice_to_text" />
          <Picker.Item label="Image-to-Text" value="image_to_text" />
        </Picker>
      </View> */}

      <View style={styles.notesContainer}>
        <View style={styles.notesHeader}>
          <Text style={styles.notesTitle}>Your Notes</Text>
          {selectedNoteId !== null && (
            <TouchableOpacity onPress={deleteNote} style={styles.deleteButton}>
              <Ionicons name="trash" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#4e73df" style={{ marginTop: 20 }} />
        ) : notes.length > 0 ? (
          notes.map((note, index) => (
            <TouchableOpacity
              key={note.id}
              style={[
                styles.noteItem,
                { backgroundColor: getNoteColor(note.type) },
                selectedNoteId === note.id && styles.selectedNote
              ]}
              onPress={() => handleNotePress(note.id)}
            >
              <View style={styles.noteContent}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteIndex}>{index + 1}.</Text>
                  <Text style={styles.noteType}>{note.type.replace(/_/g, ' ').toUpperCase()}</Text>
                </View>
                <Text style={styles.noteText}>{note.content.substring(0, 100)}...</Text>
                <Text style={styles.noteDate}>
                  {new Date(note.createdAt).toLocaleString()}
                </Text>
              </View>
              {selectedNoteId === note.id && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#4e73df" />
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noNotes}>No saved notes found for this filter/search.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f4ff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  controlsContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  picker: {
    width: 150,
    height: 45,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
  },
  notesContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    padding: 8,
    borderRadius: 8,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedNote: {
    borderColor: '#4e73df',
    borderWidth: 2,
  },
  noteContent: {
    flex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  noteIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  noteType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#ddd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  checkIcon: {
    marginLeft: 10,
  },
  noNotes: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
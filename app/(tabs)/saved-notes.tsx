import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function SavedNotesScreen() {
  const { notes } = useLocalSearchParams<{ notes?: string[] }>() || {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📑 Saved Notes</Text>
      <View style={styles.notesContainer}>
        {notes && notes.length > 0 ? (
          notes.map((note, index) => (
            <Text key={index} style={styles.note}>
              {index + 1}. {note}
            </Text>
          ))
        ) : (
          <Text style={styles.noNotes}>No saved notes.</Text>
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
  note: {
    fontSize: 18,
    marginBottom: 15,
    lineHeight: 24,
    color: '#444',
  },
  noNotes: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
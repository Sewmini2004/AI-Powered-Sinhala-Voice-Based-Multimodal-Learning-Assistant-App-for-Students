import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpScreen() {
    const router = useRouter();

    const handleEmailPress = () => {
        Linking.openURL('mailto:sewminipremodya98@gmail.com'); 
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>උදව් සහ සහාය</Text>
                <Text style={styles.description}>
                    ඔබට යෙදුම සම්බන්ධයෙන් කිසියම් ගැටලුවක්, ප්‍රශ්නයක් හෝ යෝජනාවක් ඇත්නම්, අප හා සම්බන්ධ වන්න.
                </Text>

                <TouchableOpacity style={styles.contactButton} onPress={handleEmailPress}>
                    <Ionicons name="mail" size={24} color="#fff" />
                    <Text style={styles.contactButtonText}>අපට ඊමේල් කරන්න</Text>
                </TouchableOpacity>

                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>අපගේ විශේෂාංග:</Text>
                    <Text style={styles.infoItem}>• Image-to-Text: රූපවල ඇති පෙළ හඳුනාගන්න.</Text>
                    <Text style={styles.infoItem}>• Voice Command: හඬ විධාන මගින් සටහන් සකසන්න.</Text>
                    <Text style={styles.infoItem}>• Text-to-Speech: පෙළ ශ්‍රවණය කරන්න.</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>යෙදුම පිළිබඳ:</Text>
                    <Text style={styles.infoItem}>Version: 1.0.0</Text>
                    <Text style={styles.infoItem}>Developer: Sewmini Pramodya</Text>
                    <Text style={styles.infoItem}>© 2025 All Rights Reserved.</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f0f4ff',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4e73df',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    infoSection: {
        width: '100%',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 10,
    },
    infoItem: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
});
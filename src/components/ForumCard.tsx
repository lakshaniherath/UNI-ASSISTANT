import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ForumCard = ({ item, currentUserId, onEdit, onDelete, onVote, isAnswer = false }: any) => {
  const isOwner = item.universityId === currentUserId;

  return (
    <View style={[styles.card, isAnswer && item.isMostRecommended && styles.recommendedCard]}>
      {isAnswer && item.isMostRecommended && (
        <Text style={styles.badge}>⭐ MOST RECOMMENDED ANSWER</Text>
      )}
      {!isAnswer && <Text style={styles.title}>{item.title}</Text>}
      
      <Text style={styles.content}>{item.content}</Text>
      
      <View style={styles.footer}>
        <View style={styles.voteContainer}>
          <TouchableOpacity onPress={() => onVote(item.id, true)}>
            <Text style={styles.voteBtn}>👍</Text>
          </TouchableOpacity>
          <Text style={styles.votes}>{Math.max(0, item.upvotes - (item.downvotes || 0))}</Text>
          <TouchableOpacity onPress={() => onVote(item.id, false)}>
            <Text style={styles.voteBtn}>👎</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.author}>By: {item.universityId}</Text>
        
        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionBtn}>
              <Text style={styles.actionTextError}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  recommendedCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#f1f8e9',
  },
  badge: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  content: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteBtn: {
    fontSize: 18,
    paddingHorizontal: 8,
  },
  votes: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  author: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  ownerActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    marginLeft: 12,
  },
  actionText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  actionTextError: {
    color: '#F44336',
    fontWeight: 'bold',
  },
});

export default ForumCard;

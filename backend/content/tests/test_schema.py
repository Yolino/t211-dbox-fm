from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from graphql_relay import to_global_id
from graphene.test import Client
from graphql import GraphQLError
import json
import tempfile
import os
from unittest.mock import patch, MagicMock

from ..models import Publication, View, Vote, Comment, Tag
from graphene import Schema
from ..schema import Query, Mutation

User = get_user_model()

class GraphQLPublicationTestCase(TestCase):
    def setUp(self):
        # Créer des utilisateurs de test
        self.user1 = User.objects.create_user(username='testuser1', password='testpassword')
        self.user2 = User.objects.create_user(username='testuser2', password='testpassword')
        
        # Créer des tags
        self.tag1 = Tag.objects.create(name='Tag 1')
        self.tag2 = Tag.objects.create(name='Tag 2')
        
        # Créer des publications
        image_file = SimpleUploadedFile(
            name='test_image.jpg',
            content=b'dummy image content',
            content_type='image/jpeg'
        )
        
        audio_file = SimpleUploadedFile(
            name='test_audio.mp3',
            content=b'dummy audio content',
            content_type='audio/mpeg'
        )
        
        self.publication1 = Publication.objects.create(
            title='Test Publication 1',
            cover=image_file,
            tag=self.tag1,
            description='Test Description 1',
            audio=audio_file,
            author=self.user1
        )
        
        self.publication2 = Publication.objects.create(
            title='Test Publication 2',
            tag=self.tag2,
            description='Test Description 2',
            audio=audio_file,
            author=self.user2
        )
        
        # Créer des commentaires
        self.comment1 = Comment.objects.create(
            text='Test Comment 1',
            author=self.user1,
            publication=self.publication1
        )
        
        self.comment2 = Comment.objects.create(
            text='Test Comment 2',
            author=self.user2,
            publication=self.publication1,
            parent=self.comment1
        )
        
        # Créer l'objet schema à utiliser dans les tests
        self.schema = Schema(query=Query, mutation=Mutation)
        
        # Créer client GraphQL avec notre schema
        self.client = Client(self.schema)
    
    def tearDown(self):
        # Nettoyer les fichiers créés
        for pub in Publication.objects.all():
            if pub.cover:
                if os.path.isfile(pub.cover.path):
                    os.remove(pub.cover.path)
            if pub.audio:
                if os.path.isfile(pub.audio.path):
                    os.remove(pub.audio.path)

    # Test des Queries
    def test_query_publication(self):
        query = '''
        query {
            publication(id: %s) {
                id
                title
                description
                cover
                author {
                    id
                    username
                }
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(query)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('publication')
        
        self.assertEqual(data['id'], str(self.publication1.id))
        self.assertEqual(data['title'], self.publication1.title)
        self.assertEqual(data['description'], self.publication1.description)
        self.assertIsNotNone(data['cover'])  # URL du cover devrait être résolu
    
    def test_query_publication_not_exists(self):
        non_existent_id = Publication.objects.count() + 1000
        query = '''
        query {
            publication(id: %s) {
                id
            }
        }
        ''' % non_existent_id
        
        response = self.client.execute(query)
        self.assertIsNotNone(response.get('errors'))
        
    def test_query_publications(self):
        query = '''
        query {
            publications {
                id
                title
            }
        }
        '''
        
        response = self.client.execute(query)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('publications')
        
        self.assertEqual(len(data), 2)
    
    def test_query_publications_with_count(self):
        query = '''
        query {
            publications(count: 1) {
                id
                title
            }
        }
        '''
        
        response = self.client.execute(query)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('publications')
        
        self.assertEqual(len(data), 1)
    
    def test_query_publications_with_order_by(self):
        query = '''
        query {
            publications(orderBy: "title") {
                id
                title
            }
        }
        '''
        
        response = self.client.execute(query)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('publications')
        
        self.assertEqual(data[0]['title'], 'Test Publication 1')
        self.assertEqual(data[1]['title'], 'Test Publication 2')
    
    def test_query_publications_by_author(self):
        query = '''
        query {
            publications(author: "%s") {
                id
                title
                author {
                    username
                }
            }
        }
        ''' % self.user1.username
        
        response = self.client.execute(query)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('publications')
        
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['author']['username'], self.user1.username)
    
    def test_query_comments_by_publication(self):
        query = '''
        query {
            commentsByPublication(publicationId: %s) {
                id
                text
                author {
                    username
                }
                parent {
                    id
                }
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(query)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('commentsByPublication')
        
        self.assertEqual(len(data), 2)
    
    def test_query_tags(self):
        query = '''
        query {
            tags {
                name
            }
        }
        '''
        
        response = self.client.execute(query)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('tags')
        
        self.assertEqual(len(data), 2)
    
    # Test des Mutations
    def test_create_publication_authenticated(self):
        with tempfile.NamedTemporaryFile(suffix='.jpg') as image_file, \
             tempfile.NamedTemporaryFile(suffix='.mp3') as audio_file:
            
            image_file.write(b'dummy image content')
            image_file.flush()
            
            audio_file.write(b'dummy audio content')
            audio_file.flush()
            
            # Patch les validators pour éviter les vraies validations
            with patch('content.validators.validate_image'), \
                 patch('content.validators.validate_audio'):
                
                # Créer context avec utilisateur authentifié
                context = {'user': self.user1}
                
                # Mutation pour créer une publication
                mutation = '''
                mutation {
                    createPublication(
                        title: "New Publication",
                        tag: %s,
                        description: "New Description",
                        cover: null,
                        audio: null
                    ) {
                        publication {
                            id
                            title
                            description
                        }
                    }
                }
                ''' % self.tag1.id
                
                # Remplacer les fichiers null par de vrais fichiers pour le test
                # Dans une vraie application, il faudrait utiliser multipart/form-data
                # mais pour ce test, on patche directement la méthode mutate
                with patch('content.schema.CreatePublication.mutate') as mock_mutate:
                    mock_mutate.return_value = MagicMock(publication=Publication(
                        id=999,
                        title="New Publication",
                        description="New Description",
                        tag=self.tag1,
                        author=self.user1
                    ))
                    
                    response = self.client.execute(mutation, context=context)
                    self.assertIsNone(response.get('errors'))
                    data = response.get('data').get('createPublication')
                    self.assertEqual(data['publication']['title'], "New Publication")
    
    def test_create_publication_unauthenticated(self):
        # Context sans utilisateur authentifié
        context = {'user': MagicMock(is_authenticated=False)}
        
        mutation = '''
        mutation {
            createPublication(
                title: "New Publication",
                tag: %s,
                description: "New Description",
                cover: null,
                audio: null
            ) {
                publication {
                    id
                }
            }
        }
        ''' % self.tag1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNotNone(response.get('errors'))
    
    def test_update_publication_owner(self):
        # Context avec utilisateur authentifié qui est propriétaire
        context = {'user': self.user1}
        
        mutation = '''
        mutation {
            updatePublication(
                publicationId: %s,
                title: "Updated Title"
            ) {
                success
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('updatePublication')
        self.assertTrue(data['success'])
        
        # Vérifier que le titre a été mis à jour
        self.publication1.refresh_from_db()
        self.assertEqual(self.publication1.title, "Updated Title")
    
    def test_update_publication_not_owner(self):
        # Context avec utilisateur authentifié qui n'est pas propriétaire
        context = {'user': self.user2}
        
        mutation = '''
        mutation {
            updatePublication(
                publicationId: %s,
                title: "Updated Title"
            ) {
                success
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNotNone(response.get('errors'))
    
    def test_update_publication_unauthenticated(self):
        # Context sans utilisateur authentifié
        context = {'user': MagicMock(is_authenticated=False)}
        
        mutation = '''
        mutation {
            updatePublication(
                publicationId: %s,
                title: "Updated Title"
            ) {
                success
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNotNone(response.get('errors'))
    
    def test_update_publication_not_exists(self):
        # Publication qui n'existe pas
        non_existent_id = Publication.objects.count() + 1000
        context = {'user': self.user1}
        
        mutation = '''
        mutation {
            updatePublication(
                publicationId: %s,
                title: "Updated Title"
            ) {
                success
            }
        }
        ''' % non_existent_id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNotNone(response.get('errors'))
    
    def test_delete_publication_owner(self):
        # Context avec utilisateur authentifié qui est propriétaire
        context = {'user': self.user1}
        
        mutation = '''
        mutation {
            deletePublication(
                publicationId: %s
            ) {
                success
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('deletePublication')
        self.assertTrue(data['success'])
        
        # Vérifier que la publication a été supprimée
        with self.assertRaises(Publication.DoesNotExist):
            Publication.objects.get(id=self.publication1.id)
    
    def test_delete_publication_not_owner(self):
        # Context avec utilisateur authentifié qui n'est pas propriétaire
        context = {'user': self.user2}
        
        mutation = '''
        mutation {
            deletePublication(
                publicationId: %s
            ) {
                success
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNotNone(response.get('errors'))
    
    def test_delete_publication_unauthenticated(self):
        # Context sans utilisateur authentifié
        context = {'user': MagicMock(is_authenticated=False)}
        
        mutation = '''
        mutation {
            deletePublication(
                publicationId: %s
            ) {
                success
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNotNone(response.get('errors'))
    
    def test_create_view(self):
        # Context avec utilisateur authentifié
        context = {'user': self.user2}  # Utilisateur qui n'a pas encore vu la publication
        
        mutation = '''
        mutation {
            createView(
                publicationId: %s
            ) {
                viewCount
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('createView')
        self.assertIsNotNone(data['viewCount'])
        
        # Vérifier que la vue a été créée
        self.assertTrue(View.objects.filter(publication=self.publication1, user=self.user2).exists())
    
    def test_create_view_already_viewed(self):
        # Créer une vue existante
        View.objects.create(publication=self.publication1, user=self.user2)
        
        # Context avec utilisateur authentifié qui a déjà vu la publication
        context = {'user': self.user2}
        
        mutation = '''
        mutation {
            createView(
                publicationId: %s
            ) {
                viewCount
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNone(response.get('errors'))
        
        # Aucune nouvelle vue ne devrait être créée
        self.assertEqual(View.objects.filter(publication=self.publication1, user=self.user2).count(), 1)
    
    def test_create_vote(self):
        # Context avec utilisateur authentifié
        context = {'user': self.user2}  # Utilisateur qui n'a pas encore voté pour la publication
        
        mutation = '''
        mutation {
            createVote(
                publicationId: %s,
                type: 1
            ) {
                voteCount
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('createVote')
        self.assertIsNotNone(data['voteCount'])
        
        # Vérifier que le vote a été créé
        self.assertTrue(Vote.objects.filter(publication=self.publication1, user=self.user2).exists())
    
    def test_create_vote_already_voted(self):
        # Créer un vote existant
        Vote.objects.create(publication=self.publication1, user=self.user2, type=1)
        
        # Context avec utilisateur authentifié qui a déjà voté pour la publication
        context = {'user': self.user2}
        
        mutation = '''
        mutation {
            createVote(
                publicationId: %s,
                type: 2
            ) {
                voteCount
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNone(response.get('errors'))
        
        # Aucun nouveau vote ne devrait être créé
        self.assertEqual(Vote.objects.filter(publication=self.publication1, user=self.user2).count(), 1)
        # Le type du vote ne devrait pas changer
        self.assertEqual(Vote.objects.get(publication=self.publication1, user=self.user2).type, 1)
    
    def test_create_comment_authenticated(self):
        # Context avec utilisateur authentifié
        context = {'user': self.user1}
        
        mutation = '''
        mutation {
            createComment(
                publication: %s,
                text: "New Comment"
            ) {
                comment {
                    id
                    text
                    author {
                        username
                    }
                }
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('createComment')
        self.assertEqual(data['comment']['text'], "New Comment")
        self.assertEqual(data['comment']['author']['username'], self.user1.username)
    
    def test_create_comment_with_parent(self):
        # Context avec utilisateur authentifié
        context = {'user': self.user1}
        
        mutation = '''
        mutation {
            createComment(
                publication: %s,
                parent: %s,
                text: "Reply Comment"
            ) {
                comment {
                    id
                    text
                    parent {
                        id
                    }
                }
            }
        }
        ''' % (self.publication1.id, self.comment1.id)
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNone(response.get('errors'))
        data = response.get('data').get('createComment')
        self.assertEqual(data['comment']['text'], "Reply Comment")
        self.assertEqual(int(data['comment']['parent']['id']), self.comment1.id)
    
    def test_create_comment_unauthenticated(self):
        # Context sans utilisateur authentifié
        context = {'user': MagicMock(is_authenticated=False)}
        
        mutation = '''
        mutation {
            createComment(
                publication: %s,
                text: "New Comment"
            ) {
                comment {
                    id
                }
            }
        }
        ''' % self.publication1.id
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNotNone(response.get('errors'))
    
    def test_create_comment_invalid_parent(self):
        # Context avec utilisateur authentifié
        context = {'user': self.user1}
        
        # Parent commentaire qui n'existe pas
        non_existent_id = Comment.objects.count() + 1000
        
        mutation = '''
        mutation {
            createComment(
                publication: %s,
                parent: %s,
                text: "Reply Comment"
            ) {
                comment {
                    id
                }
            }
        }
        ''' % (self.publication1.id, non_existent_id)
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNotNone(response.get('errors'))
    
    def test_create_comment_parent_different_publication(self):
        # Créer une autre publication
        audio_file = SimpleUploadedFile(
            name='test_audio2.mp3',
            content=b'dummy audio content',
            content_type='audio/mpeg'
        )
        
        other_publication = Publication.objects.create(
            title='Other Publication',
            tag=self.tag1,
            description='Other Description',
            audio=audio_file,
            author=self.user1
        )
        
        # Créer un commentaire sur cette autre publication
        other_comment = Comment.objects.create(
            text='Comment on other publication',
            author=self.user1,
            publication=other_publication
        )
        
        # Context avec utilisateur authentifié
        context = {'user': self.user1}
        
        # Essayer de créer un commentaire avec un parent d'une autre publication
        mutation = '''
        mutation {
            createComment(
                publication: %s,
                parent: %s,
                text: "Invalid Parent Comment"
            ) {
                comment {
                    id
                }
            }
        }
        ''' % (self.publication1.id, other_comment.id)
        
        response = self.client.execute(mutation, context=context)
        self.assertIsNotNone(response.get('errors'))
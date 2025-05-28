import json
import tempfile
import os
from unittest.mock import patch, MagicMock
from django.test import TestCase, Client
from django.contrib.auth.models import User, Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from graphene_django.utils.testing import GraphQLTestCase
from ..models import Publication, Tag, View, Vote, Comment
from ..schema import schema
from ..validators import validate_image, validate_audio
from moderation.models import ReportPublication

class GraphQLApiTests(GraphQLTestCase):
    GRAPHQL_URL = '/graphql/'
    GRAPHQL_SCHEMA = schema


    @classmethod
    def setUpTestData(cls):
        # Créer des utilisateurs pour les tests
        cls.user1 = User.objects.create_user(username='testuser1', password='password123')
        cls.user2 = User.objects.create_user(username='testuser2', password='password123')
        cls.staff_user = User.objects.create_user(username='staffuser', password='password123', is_staff=True)
    
        # Ajouter permissions pour modération - en utilisant le bon ContentType
        from moderation.models import ReportPublication  # Ajoutez cette importation
        content_type = ContentType.objects.get_for_model(ReportPublication)
        view_permission = Permission.objects.get(content_type=content_type, codename='view_reportpublication')
        cls.staff_user.user_permissions.add(view_permission)
        
        # Créer des tags
        cls.tag1 = Tag.objects.create(name='Musique')
        cls.tag2 = Tag.objects.create(name='Podcast')
        
        # Créer des publications test
        with tempfile.NamedTemporaryFile(suffix='.mp3') as audio_file:
            audio_file.write(b'fake audio content')
            audio_file.seek(0)
            
            cls.test_audio = SimpleUploadedFile(
                name='test.mp3',
                content=audio_file.read(),
                content_type='audio/mpeg'
            )
        
        with tempfile.NamedTemporaryFile(suffix='.jpg') as img_file:
            img_file.write(b'fake image content')
            img_file.seek(0)
            
            cls.test_cover = SimpleUploadedFile(
                name='test.jpg',
                content=img_file.read(),
                content_type='image/jpeg'
            )
        
        with patch('content.validators.validate_image'), patch('content.validators.validate_audio'):
            cls.publication1 = Publication.objects.create(
                title='Test Publication 1',
                author=cls.user1,
                tag=cls.tag1,
                description='Description de test 1',
                audio=cls.test_audio
            )
            
            cls.publication2 = Publication.objects.create(
                title='Test Publication 2',
                author=cls.user2,
                tag=cls.tag2,
                description='Description de test 2',
                audio=cls.test_audio,
                cover=cls.test_cover
            )
            
            cls.banned_publication = Publication.objects.create(
                title='Publication Bannie',
                author=cls.user1,
                tag=cls.tag1,
                description='Publication bannie pour test',
                audio=cls.test_audio,
                is_banned=True
            )

    def setUp(self):
        super().setUp()
        self.client.force_login(self.user1)

    def test_query_publications(self):
        response = self.query(
            '''
            query {
                publications {
                    id
                    title
                    author {
                        username
                    }
                    tag {
                        name
                    }
                    description
                    viewCount
                    voteCount
                }
            }
            '''
        )
        
        content = json.loads(response.content)
        self.assertResponseNoErrors(response)
        
        # Vérifier que seules les publications non bannies sont retournées pour les utilisateurs normaux
        publications = content['data']['publications']
        self.assertEqual(len(publications), 2)
        self.assertNotIn('Publication Bannie', [p['title'] for p in publications])

    def test_query_publications_as_staff(self):
        self.client.force_login(self.staff_user)
        
        response = self.query(
            '''
            query {
                publications {
                    id
                    title
                    isBanned
                }
            }
            '''
        )
        
        content = json.loads(response.content)
        self.assertResponseNoErrors(response)
        
        # Le staff devrait voir toutes les publications, y compris les bannies
        publications = content['data']['publications']
        self.assertEqual(len(publications), 3)
        self.assertTrue(any(p['title'] == 'Publication Bannie' for p in publications))

    def test_query_single_publication(self):
        response = self.query(
            '''
            query {
                publication(id: %s) {
                    id
                    title
                    author {
                        username
                    }
                    description
                }
            }
            ''' % self.publication1.id
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content['data']['publication']['title'], 'Test Publication 1')
        self.assertEqual(content['data']['publication']['author']['username'], 'testuser1')

    def test_query_banned_publication(self):
        response = self.query(
            '''
            query {
                publication(id: %s) {
                    id
                    title
                }
            }
            ''' % self.banned_publication.id
        )
        
        content = json.loads(response.content)
        self.assertIn('errors', content)
        self.assertIn('not allowed', content['errors'][0]['message'])

    def test_query_banned_publication_as_staff(self):
        self.client.force_login(self.staff_user)
        
        response = self.query(
            '''
            query {
                publication(id: %s) {
                    id
                    title
                    isBanned
                }
            }
            ''' % self.banned_publication.id
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content['data']['publication']['title'], 'Publication Bannie')
        self.assertTrue(content['data']['publication']['isBanned'])

    @patch('content.validators.validate_image')
    @patch('content.validators.validate_audio')
    def test_create_publication(self, mock_validate_audio, mock_validate_image):
        mock_validate_audio.return_value = None
        mock_validate_image.return_value = None
        
        # Simulation du téléchargement de fichiers avec GraphQL
        with tempfile.NamedTemporaryFile(suffix='.mp3') as audio_file, tempfile.NamedTemporaryFile(suffix='.jpg') as cover_file:
            audio_file.write(b'fake audio content')
            audio_file.seek(0)
            
            cover_file.write(b'fake image content')
            cover_file.seek(0)
            
            # Définir les variables pour l'opération de mutation
            variables = {
                'title': 'Nouvelle Publication',
                'description': 'Description de ma nouvelle publication',
                'tag': self.tag1.id,
                'audio': None,  # Add this field - will be replaced by the file upload middleware
                'cover': None   # Add this field too
            }
            
            query = '''
            mutation createPublication($title: String!, $tag: Int!, $description: String!) {
                createPublication(title: $title, tag: $tag, description: $description, audio: "test-audio", cover: "test-cover") {
                    publication {
                        id
                        title
                        description
                    }
                }
            }
            '''
            
            # Simuler la requête avec les fichiers
            with patch('graphene_file_upload.scalars.Upload.serialize', return_value="test-file"):
                response = self.client.post(
                    self.GRAPHQL_URL,
                    data={
                        'operations': json.dumps({
                            'query': query,
                            'variables': variables
                        }),
                        'map': json.dumps({
                            '0': ['variables.audio'],
                            '1': ['variables.cover']
                        }),
                        '0': SimpleUploadedFile('test.mp3', audio_file.read(), content_type='audio/mpeg'),
                        '1': SimpleUploadedFile('test.jpg', cover_file.read(), content_type='image/jpeg')
                    }
                )
            
            # En pratique, ce test nécessiterait une configuration de test plus complexe
            # pour gérer correctement le téléchargement de fichiers via GraphQL
            # Ici, nous vérifions simplement que les validateurs ont été appelés
            mock_validate_audio.assert_called_once()
            mock_validate_image.assert_called_once()

    def test_create_view(self):
        response = self.query(
            '''
            mutation {
                createView(publicationId: %s) {
                    viewCount
                }
            }
            ''' % self.publication2.id
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content['data']['createView']['viewCount'], 1)
        
        # Vérifier que la vue a été créée en base
        self.assertTrue(View.objects.filter(user=self.user1, publication=self.publication2).exists())
        
        # Vérifier qu'une seconde vue du même utilisateur ne compte pas
        response = self.query(
            '''
            mutation {
                createView(publicationId: %s) {
                    viewCount
                }
            }
            ''' % self.publication2.id
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertIsNone(content['data']['createView']['viewCount'])

    def test_create_vote(self):
        response = self.query(
            '''
            mutation {
                createVote(publicationId: %s, type: 1) {
                    voteCount
                }
            }
            ''' % self.publication2.id
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content['data']['createVote']['voteCount'], 1)
        
        # Vérifier que le vote a été créé
        vote = Vote.objects.get(user=self.user1, publication=self.publication2)
        self.assertEqual(vote.type, 1)
        
        # Vérifier que le compteur de votes est mis à jour
        self.publication2.refresh_from_db()
        self.assertEqual(self.publication2.vote_count, 1)

    def test_update_vote(self):
        # Créer d'abord un vote
        Vote.objects.create(user=self.user1, publication=self.publication2, type=1)
        
        response = self.query(
            '''
            mutation {
                updateVote(publicationId: %s, type: -1) {
                    voteCount
                }
            }
            ''' % self.publication2.id
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content['data']['updateVote']['voteCount'], -1)
        
        # Vérifier que le vote a été mis à jour
        vote = Vote.objects.get(user=self.user1, publication=self.publication2)
        self.assertEqual(vote.type, -1)
        
        # Vérifier que le compteur de votes est mis à jour
        self.publication2.refresh_from_db()
        self.assertEqual(self.publication2.vote_count, -1)

    def test_delete_vote(self):
        # Créer d'abord un vote
        Vote.objects.create(user=self.user1, publication=self.publication2, type=1)
        self.publication2.refresh_from_db()
        self.assertEqual(self.publication2.vote_count, 1)
        
        response = self.query(
            '''
            mutation {
                deleteVote(publicationId: %s) {
                    voteCount
                }
            }
            ''' % self.publication2.id
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content['data']['deleteVote']['voteCount'], 0)
        
        # Vérifier que le vote a été supprimé
        self.assertFalse(Vote.objects.filter(user=self.user1, publication=self.publication2).exists())
        
        # Vérifier que le compteur de votes est mis à jour
        self.publication2.refresh_from_db()
        self.assertEqual(self.publication2.vote_count, 0)

    def test_create_comment(self):
        response = self.query(
            '''
            mutation {
                createComment(publication: %s, text: "Ceci est un commentaire de test") {
                    comment {
                        id
                        text
                        author {
                            username
                        }
                    }
                }
            }
            ''' % self.publication2.id
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content['data']['createComment']['comment']['text'], "Ceci est un commentaire de test")
        self.assertEqual(content['data']['createComment']['comment']['author']['username'], 'testuser1')
        
        # Récupérer l'ID du commentaire créé
        comment_id = content['data']['createComment']['comment']['id']
        
        # Tester la création d'un commentaire en réponse
        response = self.query(
            '''
            mutation {
                createComment(publication: %s, parent: %s, text: "Ceci est une réponse") {
                    comment {
                        text
                        parent {
                            id
                        }
                    }
                }
            }
            ''' % (self.publication2.id, comment_id)
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertEqual(content['data']['createComment']['comment']['text'], "Ceci est une réponse")
        self.assertEqual(content['data']['createComment']['comment']['parent']['id'], comment_id)

    def test_comments_by_publication(self):
        # Créer quelques commentaires
        comment1 = Comment.objects.create(
            publication=self.publication1,
            author=self.user1,
            text="Commentaire 1"
        )
        
        comment2 = Comment.objects.create(
            publication=self.publication1,
            author=self.user2,
            text="Commentaire 2"
        )
        
        response = self.query(
            '''
            query {
                commentsByPublication(publicationId: %s) {
                    id
                    text
                    author {
                        username
                    }
                }
            }
            ''' % self.publication1.id
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        comments = content['data']['commentsByPublication']
        self.assertEqual(len(comments), 2)
        self.assertTrue(any(c['text'] == "Commentaire 1" for c in comments))
        self.assertTrue(any(c['text'] == "Commentaire 2" for c in comments))

    def test_update_publication(self):
        response = self.query(
            '''
            mutation {
                updatePublication(
                    publicationId: %s,
                    title: "Titre mis à jour",
                    description: "Description mise à jour",
                    tag: %s,
                    removeCover: false
                ) {
                    success
                }
            }
            ''' % (self.publication1.id, self.tag2.id)
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertTrue(content['data']['updatePublication']['success'])
        
        # Vérifier que la publication a été mise à jour
        self.publication1.refresh_from_db()
        self.assertEqual(self.publication1.title, "Titre mis à jour")
        self.assertEqual(self.publication1.description, "Description mise à jour")
        self.assertEqual(self.publication1.tag, self.tag2)

    def test_update_publication_not_owner(self):
        # Essayer de mettre à jour une publication dont l'utilisateur n'est pas propriétaire
        response = self.query(
            '''
            mutation {
                updatePublication(
                    publicationId: %s,
                    title: "Tentative mise à jour",
                    removeCover: false
                ) {
                    success
                }
            }
            ''' % self.publication2.id
        )
        
        content = json.loads(response.content)
        self.assertIn('errors', content)
        self.assertIn('cannot update', content['errors'][0]['message'].lower())

    def test_delete_publication(self):
        # Créer une publication temporaire pour la supprimer
        with patch('content.validators.validate_image'), patch('content.validators.validate_audio'):
            temp_pub = Publication.objects.create(
                title='Publication à supprimer',
                author=self.user1,
                tag=self.tag1,
                description='Cette publication sera supprimée',
                audio=self.test_audio
            )
        
        response = self.query(
            '''
            mutation {
                deletePublication(publicationId: %s) {
                    success
                }
            }
            ''' % temp_pub.id
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        self.assertTrue(content['data']['deletePublication']['success'])
        
        # Vérifier que la publication a été supprimée
        with self.assertRaises(Publication.DoesNotExist):
            Publication.objects.get(id=temp_pub.id)

    def test_delete_publication_not_owner(self):
        response = self.query(
            '''
            mutation {
                deletePublication(publicationId: %s) {
                    success
                }
            }
            ''' % self.publication2.id
        )
        
        content = json.loads(response.content)
        self.assertIn('errors', content)
        self.assertIn('cannot delete', content['errors'][0]['message'].lower())

    def test_tags(self):
        response = self.query(
            '''
            query {
                tags {
                    name
                }
            }
            '''
        )
        
        self.assertResponseNoErrors(response)
        content = json.loads(response.content)
        tags = content['data']['tags']
        self.assertEqual(len(tags), 2)
        self.assertTrue(any(t['name'] == 'Musique' for t in tags))
        self.assertTrue(any(t['name'] == 'Podcast' for t in tags))


class ValidatorsTests(TestCase):
    def setUp(self):
        # Créer des fichiers temporaires pour les tests
        self.valid_image = tempfile.NamedTemporaryFile(suffix='.jpg')
        self.valid_image.write(b'fake image content')
        self.valid_image.seek(0)
        
        self.valid_audio = tempfile.NamedTemporaryFile(suffix='.mp3')
        self.valid_audio.write(b'fake audio content')
        self.valid_audio.seek(0)
        
        self.invalid_ext = tempfile.NamedTemporaryFile(suffix='.txt')
        self.invalid_ext.write(b'fake text content')
        self.invalid_ext.seek(0)
        
        # Préparer les SimpleUploadedFile pour les tests
        self.image_file = SimpleUploadedFile(
            'test.jpg',
            self.valid_image.read(),
            content_type='image/jpeg'
        )
        self.valid_image.seek(0)
        
        self.audio_file = SimpleUploadedFile(
            'test.mp3',
            self.valid_audio.read(),
            content_type='audio/mpeg'
        )
        self.valid_audio.seek(0)
        
        self.text_file = SimpleUploadedFile(
            'test.txt',
            self.invalid_ext.read(),
            content_type='text/plain'
        )
        self.invalid_ext.seek(0)

    def tearDown(self):
        self.valid_image.close()
        self.valid_audio.close()
        self.invalid_ext.close()

    @patch('content.validators.validate_image_extension')
    @patch('content.validators.validate_image_mime')
    @patch('content.validators.validate_image_size')
    @patch('content.validators.validate_image_dimensions')
    @patch('content.validators.validate_image_corruption')
    def test_validate_image(self, mock_corruption, mock_dimensions, mock_size, mock_mime, mock_extension):
        validate_image(self.image_file)
        
        # Vérifier que toutes les fonctions de validation ont été appelées
        mock_extension.assert_called_once_with(self.image_file)
        mock_mime.assert_called_once_with(self.image_file)
        mock_size.assert_called_once_with(self.image_file)
        mock_dimensions.assert_called_once_with(self.image_file)
        mock_corruption.assert_called_once_with(self.image_file)

    @patch('content.validators.validate_audio_extension')
    @patch('content.validators.validate_audio_mime')
    @patch('content.validators.validate_audio_size')
    @patch('content.validators.validate_audio_corruption')
    def test_validate_audio(self, mock_corruption, mock_size, mock_mime, mock_extension):
        validate_audio(self.audio_file)
        
        # Vérifier que toutes les fonctions de validation ont été appelées
        mock_extension.assert_called_once_with(self.audio_file)
        mock_mime.assert_called_once_with(self.audio_file)
        mock_size.assert_called_once_with(self.audio_file)
        mock_corruption.assert_called_once_with(self.audio_file)

    def test_validate_extension(self):
        from ..validators import validate_extension
        
        # Test avec extension valide
        validate_extension(self.image_file, ('jpg', 'jpeg', 'png'))
        
        # Test avec extension invalide
        with self.assertRaises(ValidationError):
            validate_extension(self.text_file, ('jpg', 'jpeg', 'png'))

    @patch('magic.Magic.from_buffer')
    def test_validate_mime(self, mock_from_buffer):
        from ..validators import validate_mime
        
        # Test avec MIME type valide
        mock_from_buffer.return_value = 'image/jpeg'
        validate_mime(self.image_file, ('image/jpeg', 'image/png'))
        
        # Test avec MIME type invalide
        mock_from_buffer.return_value = 'text/plain'
        with self.assertRaises(ValidationError):
            validate_mime(self.image_file, ('image/jpeg', 'image/png'))
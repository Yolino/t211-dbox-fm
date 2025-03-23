from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db.utils import IntegrityError
from unittest.mock import patch, MagicMock

from ..models import Tag, Publication, View, Vote, Follower, Comment


# TEST model.py

class TagModelTest(TestCase):
    def test_tag_creation(self):
        tag = Tag.objects.create(name="Test Tag")
        self.assertEqual(str(tag), "Test Tag")
        self.assertEqual(tag.name, "Test Tag")

class PublicationModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Créer un utilisateur de test
        cls.user = User.objects.create_user(username='testuser', password='password')
        # Créer un tag de test
        cls.tag = Tag.objects.create(name="Test Tag")
        
    def setUp(self):
        # Créer un fichier audio simulé
        self.audio_file = SimpleUploadedFile("test_audio.mp3", b"audio content", content_type="audio/mpeg")
        # Créer une image simulée
        self.image_file = SimpleUploadedFile("test_image.jpg", b"image content", content_type="image/jpeg")
        
    @patch('content.validators.validate_audio')
    @patch('content.validators.validate_image')
    def test_publication_creation(self, mock_validate_image, mock_validate_audio):
        # Configuration des mocks pour les validateurs
        mock_validate_image.return_value = None
        mock_validate_audio.return_value = None
        
        publication = Publication.objects.create(
            title="Test Publication",
            author=self.user,
            tag=self.tag,
            description="Test Description",
            audio=self.audio_file,
            cover=self.image_file
        )
        
        self.assertEqual(publication.title, "Test Publication")
        self.assertEqual(publication.author, self.user)
        self.assertEqual(publication.tag, self.tag)
        self.assertEqual(publication.description, "Test Description")
        self.assertEqual(publication.view_count, 0)
        self.assertEqual(publication.vote_count, 0)
        self.assertFalse(publication.is_banned)
        self.assertEqual(str(publication), f"{self.user} - Test Publication")

class ViewModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Créer un utilisateur de test
        cls.user = User.objects.create_user(username='testuser', password='password')
        # Créer un tag de test
        cls.tag = Tag.objects.create(name="Test Tag")
        
    def setUp(self):
        # Créer un fichier audio simulé avec mock pour éviter la validation
        with patch('content.validators.validate_audio') as mock_validate_audio:
            mock_validate_audio.return_value = None
            self.audio_file = SimpleUploadedFile("test_audio.mp3", b"audio content", content_type="audio/mpeg")
            
            # Créer une publication pour les tests
            self.publication = Publication.objects.create(
                title="Test Publication",
                author=self.user,
                tag=self.tag,
                audio=self.audio_file
            )
    
    def test_view_creation(self):
        # Test de création de vue
        view = View.objects.create(publication=self.publication, user=self.user)
        
        # Vérifier que la vue a été créée correctement
        self.assertEqual(view.publication, self.publication)
        self.assertEqual(view.user, self.user)
        
        # Rafraîchir l'objet publication depuis la base de données
        self.publication.refresh_from_db()
        
        # Vérifier que le compteur de vues a été incrémenté
        self.assertEqual(self.publication.view_count, 1)
        self.assertEqual(str(view), f"{self.publication} : {self.user}")
    
    def test_view_deletion(self):
        # Créer une vue
        view = View.objects.create(publication=self.publication, user=self.user)
        
        # Rafraîchir l'objet publication depuis la base de données
        self.publication.refresh_from_db()
        self.assertEqual(self.publication.view_count, 1)
        
        # Supprimer la vue
        view.delete()
        
        # Rafraîchir l'objet publication depuis la base de données
        self.publication.refresh_from_db()
        
        # Vérifier que le compteur de vues a été décrémenté
        self.assertEqual(self.publication.view_count, 0)
    
    def test_view_uniqueness_constraint(self):
        # Créer une première vue
        View.objects.create(publication=self.publication, user=self.user)
        
        # Tenter de créer une deuxième vue avec les mêmes valeurs
        with self.assertRaises(IntegrityError):
            View.objects.create(publication=self.publication, user=self.user)

class VoteModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Créer un utilisateur de test
        cls.user = User.objects.create_user(username='testuser', password='password')
        # Créer un tag de test
        cls.tag = Tag.objects.create(name="Test Tag")
        
    def setUp(self):
        # Créer un fichier audio simulé avec mock pour éviter la validation
        with patch('content.validators.validate_audio') as mock_validate_audio:
            mock_validate_audio.return_value = None
            self.audio_file = SimpleUploadedFile("test_audio.mp3", b"audio content", content_type="audio/mpeg")
            
            # Créer une publication pour les tests
            self.publication = Publication.objects.create(
                title="Test Publication",
                author=self.user,
                tag=self.tag,
                audio=self.audio_file
            )
    
    def test_upvote_creation(self):
        # Test de création d'un vote positif (type = 1)
        vote = Vote.objects.create(publication=self.publication, user=self.user, type=1)
        
        # Vérifier que le vote a été créé correctement
        self.assertEqual(vote.publication, self.publication)
        self.assertEqual(vote.user, self.user)
        self.assertEqual(vote.type, 1)
        
        # Rafraîchir l'objet publication depuis la base de données
        self.publication.refresh_from_db()
        
        # Vérifier que le compteur de votes a été incrémenté
        self.assertEqual(self.publication.vote_count, 1)
        self.assertEqual(str(vote), f"{self.publication} : 1 - {self.user}")
    
    def test_downvote_creation(self):
        # Test de création d'un vote négatif (type = -1)
        vote = Vote.objects.create(publication=self.publication, user=self.user, type=-1)
        
        # Rafraîchir l'objet publication depuis la base de données
        self.publication.refresh_from_db()
        
        # Vérifier que le compteur de votes a été décrémenté
        self.assertEqual(self.publication.vote_count, -1)
    
    def test_vote_deletion(self):
        # Créer un vote
        vote = Vote.objects.create(publication=self.publication, user=self.user, type=1)
        
        # Rafraîchir l'objet publication depuis la base de données
        self.publication.refresh_from_db()
        self.assertEqual(self.publication.vote_count, 1)
        
        # Supprimer le vote
        vote.delete()
        
        # Rafraîchir l'objet publication depuis la base de données
        self.publication.refresh_from_db()
        
        # Vérifier que le compteur de votes a été décrémenté
        self.assertEqual(self.publication.vote_count, 0)
    
    def test_vote_uniqueness_constraint(self):
        # Créer un premier vote
        Vote.objects.create(publication=self.publication, user=self.user, type=1)
        
        # Tenter de créer un deuxième vote avec les mêmes valeurs
        with self.assertRaises(IntegrityError):
            Vote.objects.create(publication=self.publication, user=self.user, type=-1)

class FollowerModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Créer deux utilisateurs de test
        cls.user1 = User.objects.create_user(username='user1', password='password')
        cls.user2 = User.objects.create_user(username='user2', password='password')
    
    def test_follower_creation(self):
        # Test de création d'une relation de suivi
        follower = Follower.objects.create(follower=self.user1, following=self.user2)
        
        # Vérifier que la relation a été créée correctement
        self.assertEqual(follower.follower, self.user1)
        self.assertEqual(follower.following, self.user2)
        self.assertEqual(str(follower), f"{self.user2} followed by {self.user1}")

class CommentModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Créer deux utilisateurs de test
        cls.user1 = User.objects.create_user(username='user1', password='password')
        cls.user2 = User.objects.create_user(username='user2', password='password')
        # Créer un tag de test
        cls.tag = Tag.objects.create(name="Test Tag")
        
    def setUp(self):
        # Créer un fichier audio simulé avec mock pour éviter la validation
        with patch('content.validators.validate_audio') as mock_validate_audio:
            mock_validate_audio.return_value = None
            self.audio_file = SimpleUploadedFile("test_audio.mp3", b"audio content", content_type="audio/mpeg")
            
            # Créer deux publications pour les tests
            self.publication1 = Publication.objects.create(
                title="Test Publication 1",
                author=self.user1,
                tag=self.tag,
                audio=self.audio_file
            )
            
            self.publication2 = Publication.objects.create(
                title="Test Publication 2",
                author=self.user1,
                tag=self.tag,
                audio=self.audio_file
            )
    
    def test_comment_creation(self):
        # Test de création d'un commentaire
        comment = Comment.objects.create(
            publication=self.publication1,
            author=self.user2,
            text="Test comment"
        )
        
        # Vérifier que le commentaire a été créé correctement
        self.assertEqual(comment.publication, self.publication1)
        self.assertEqual(comment.author, self.user2)
        self.assertEqual(comment.text, "Test comment")
        self.assertIsNone(comment.parent)
        self.assertFalse(comment.is_banned)
        self.assertEqual(str(comment), f"{self.publication1} : {self.user2} commented 'Test comment'")
    
    def test_reply_creation(self):
        # Créer un commentaire parent
        parent_comment = Comment.objects.create(
            publication=self.publication1,
            author=self.user1,
            text="Parent comment"
        )
        
        # Créer un commentaire en réponse
        reply = Comment(
            publication=self.publication1,
            author=self.user2,
            parent=parent_comment,
            text="Reply comment"
        )
        reply.clean()  # Appeler clean explicitement pour tester la validation
        reply.save()
        
        # Vérifier que la réponse a été créée correctement
        self.assertEqual(reply.parent, parent_comment)
    
    def test_reply_validation_error(self):
        # Créer un commentaire parent sur une publication
        parent_comment = Comment.objects.create(
            publication=self.publication1,
            author=self.user1,
            text="Parent comment"
        )
        
        # Tenter de créer une réponse sur une publication différente
        reply = Comment(
            publication=self.publication2,  # Publication différente
            author=self.user2,
            parent=parent_comment,  # Parent de l'autre publication
            text="Reply comment"
        )
        
        # Vérifier que la validation échoue
        with self.assertRaises(ValidationError):
            reply.clean()
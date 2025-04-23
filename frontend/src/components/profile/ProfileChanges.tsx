import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import UPDATE_PASSWORD_MUTATION from '../../graphql/updatePasswordMutation.ts';
import UPDATE_USERNAME_MUTATION from '../../graphql/updateUsernameMutation.ts';
import UPDATE_EMAIL_MUTATION from '../../graphql/updateEmailMutation.ts';
import PROFILE_QUERY from '../../graphql/profileQuery.ts';
import LoadingIcon from '../../svg/LoadingIcon.tsx';

interface ProfileChangesProps {
	username: string;
}

const ProfileChanges = ({ username }: ProfileChangesProps) => {
	const [currentUsername, setCurrentUsername] = useState(username);
	const [newUsername, setNewUsername] = useState('');
	const [newEmail, setNewEmail] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [passwordUsername, setPasswordUsername] = useState('');
	const [passwordEmail, setPasswordEmail] = useState('');
	const [passwordPassword, setPasswordPassword] = useState('');
	const [passwordVerification, setPasswordVerification] = useState('');
	const [usernameError, setUsernameError] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');

	const [updateUsername, { loading: usernameLoading }] = useMutation(UPDATE_USERNAME_MUTATION);
	const [updateEmail, {loading: emailLoading}] = useMutation(UPDATE_EMAIL_MUTATION);
	const [updatePassword, {loading: passwordLoading}] = useMutation(UPDATE_PASSWORD_MUTATION);
	const { data, refetch } = useQuery(PROFILE_QUERY, {
		variables: { username: currentUsername },})
	const profile = data?.profile;

	const handleSubmitUsername = (event: React.FormEvent) => {
		event.preventDefault();
		updateUsername({variables: {
			newUsername: newUsername, 
			password: passwordUsername}
		}).then(() =>
		setCurrentUsername(newUsername),
		refetch(),
		setNewUsername(''),
		setPasswordUsername(''),
		setUsernameError('') 
			   ).catch((err) => setUsernameError(`${err}`));
	}

	const handleSubmitEmail = (event: React.FormEvent) => {
		event.preventDefault();
		updateEmail({variables: {
			newEmail: newEmail, 
			password: passwordEmail}
		}).then(() =>
		refetch(),
		setNewEmail(''),
		setPasswordEmail(''),
		setEmailError('') 
			   ).catch((err) => setEmailError(`${err}`));
	}

	const handleSubmitPassword = (event: React.FormEvent) => {
		event.preventDefault();
		if(!(passwordPassword === passwordVerification)) {
			setPasswordError('Password don\'t match verification')
		} else {
		updatePassword({variables: {
			currentPassword: passwordPassword, 
			newPassword: newPassword}
		}).then(() =>
		refetch(),
		setNewPassword(''),
		setPasswordPassword(''),
		setPasswordVerification(''),
		setPasswordError('') 
			   ).catch((err) => setPasswordError(`${err}`));
		}
	}

	return <div className='text-white'>
		<p className='mt-5 mb-3 text-2xl font-bold'>Change user informations</p>
		<div className='mb-5'>
			<p className='mb-1 text-xl font-bold'>Change your username:</p>
			{!usernameLoading ?
			<p className='text-lg font-bold mb-2'>Your current username: {profile?.user?.username ? profile.user.username : 'No username'}</p> :
			<LoadingIcon />
			}
			<form onSubmit={handleSubmitUsername} className='text-black flex'>
				<input className='rounded-lg mr-2 min-w-[200px] pl-1'
				type='text' 
				placeholder='Your new username' 
				name='new_username' 
				value={newUsername} 
				onChange={(event) => 
					setNewUsername(event.target.value)
				} 
				required />
				<input className='rounded-lg mr-2 min-w-[250px] pl-1'
				type='password' 
				placeholder='Your account password' 
				name='password' 
				value={passwordUsername} 
				onChange={(event) => 
					setPasswordUsername(event.target.value)
				} 
				required />
				{!usernameLoading ?
				<button type='submit' className='bg-white p-1 rounded-lg hover:bg-gray-200 trasition duration-200 ease-in-out'>submit</button> :
				<div className='text-white'>
				<LoadingIcon />
				</div>
				}
			</form>
			<p className='text-red-500'>{usernameError}</p>
		</div>
		<div className='mb-5'>
			<p className='mb-1 text-xl font-bold'>Change your email:</p>
			{!emailLoading ?
			<p className='mb-2 text-lg font-bold'> Your current email adress: {profile?.user?.email ? profile.user.email : 'no Email address'}</p> :
			<LoadingIcon />
			}
			<form onSubmit={handleSubmitEmail} className='text-black flex'>
				<input className='rounded-lg mr-2 min-w-[200px] pl-1'
				type='text' 
				placeholder='Your new Email' 
				name='new_email' 
				value={newEmail} 
				onChange={(event) => 
					setNewEmail(event.target.value)
				} 
				required />
				<input className='rounded-lg mr-2 min-w-[250px] pl-1'
				type='password' 
				placeholder='Your account password' 
				name='password' 
				value={passwordEmail} 
				onChange={(event) => 
					setPasswordEmail(event.target.value)
				} 
				required />
				{!emailLoading ?
				<button type='submit' className='bg-white p-1 rounded-lg hover:bg-gray-200 trasition duration-200 ease-in-out'>submit</button> :
				<div className='text-white'>
				<LoadingIcon />
				</div>
				}
			</form>
			<p className='text-red-500'>{emailError}</p>
		</div>
		<div>
			<p className='text-lg font-bold mb-1'>Change you password:</p>
			<form onSubmit={handleSubmitPassword} className='text-black flex flex flex-col'>
				<input className='rounded-lg mb-3 min-w-[250px] max-w-[325px] p-1'
				type='password' 
				placeholder='Your new password' 
				name='new_password' 
				value={newPassword} 
				onChange={(event) => 
					setNewPassword(event.target.value)
				} 
				required />
				<input className='rounded-lg mb-3 min-w-[250px] max-w-[325px] p-1' 
				type='password' 
				placeholder='Your current account password' 
				name='password' 
				value={passwordPassword} 
				onChange={(event) => 
					setPasswordPassword(event.target.value)
				}
				required />
				<input className='rounded-lg mb-3 min-w-[250px] max-w-[325px] p-1'
				type='password' 
				placeholder='Your current account password verification' 
				name='password' 
				value={passwordVerification} 
				onChange={(event) => 
					setPasswordVerification(event.target.value)
				}
				required />
				<div>
					{!passwordLoading ?
					<button type='submit' className='bg-white p-1 rounded-lg hover:bg-gray-200 trasition duration-200 ease-in-out'>submit</button> :
					<div className='text-white'>
					<LoadingIcon />
					</div>
					}
				</div>
			</form>
			<p className='text-red-500'>{passwordError}</p>
		</div>
	</div>
}

export default ProfileChanges;


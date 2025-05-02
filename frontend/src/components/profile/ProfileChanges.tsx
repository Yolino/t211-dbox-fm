import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useMutation } from '@apollo/client';
import UPDATE_PASSWORD_MUTATION from '../../graphql/updatePasswordMutation.ts';
import UPDATE_USERNAME_MUTATION from '../../graphql/updateUsernameMutation.ts';
import EditIcon from "../../svg/EditIcon.tsx";
import LoadingIcon from '../../svg/LoadingIcon.tsx';

const ProfileChanges = ({ profile }: ProfileChangesProps) => {
  const navigate = useNavigate();
	const [newUsername, setNewUsername] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [passwordUsername, setPasswordUsername] = useState('');
	const [passwordPassword, setPasswordPassword] = useState('');
	const [passwordVerification, setPasswordVerification] = useState('');
	const [usernameError, setUsernameError] = useState('');
	const [passwordError, setPasswordError] = useState('');
  const [editField, setEditField] = useState("");

	const [updateUsername, { loading: usernameLoading }] = useMutation(UPDATE_USERNAME_MUTATION);
	const [updatePassword, {loading: passwordLoading}] = useMutation(UPDATE_PASSWORD_MUTATION);

	const handleSubmitUsername = (event: React.FormEvent) => {
		event.preventDefault();
		updateUsername({variables: {
			newUsername: newUsername, 
			password: passwordUsername}
		}).then(() => {
      setEditField("");
      setPasswordUsername("");
      navigate(`/profile/${newUsername}`);
		}).catch((err) => { setUsernameError(`${err}`) });
	}	

	const handleSubmitPassword = (event: React.FormEvent) => {
		event.preventDefault();
		if(!(newPassword === passwordVerification)) {
			setPasswordError('Password don\'t match verification')
		} else {
		  updatePassword({variables: {
			currentPassword: passwordPassword, 
			newPassword: newPassword}
		  }).then(() => {
        setEditField("");
		    setNewPassword('');
		    setPasswordPassword('');
		    setPasswordVerification('');
		    setPasswordError('');
      }).catch((err) => setPasswordError(`${err}`));
    }
	}

	return (
    <div className='text-white'>
		  <p className='mt-5 mb-3 text-2xl font-bold'>User information</p>
      <div className={`mb-5 bg-gray-200 text-gray-800 p-3 rounded-md ${profile?.user?.isActive ? "" : "bg-red-200 text-red-800"}`}>
        <div className="flex gap-5">
          <p>Status :</p>
          <p className="font-bold">{profile?.user?.isActive ? "Active" : "Banned"}</p>
        </div>
      </div>
		  <div className='mb-5 bg-gray-200 text-gray-800 p-3 rounded-md'>
        {editField === "username" ? (
          <div>
            <h2 className="mb-2 text-gray-800 text-xl font-bold">Change your username</h2>
            <form onSubmit={handleSubmitUsername} className='flex justify-between gap-5'>
              <div className="flex flex-col w-full lg:flex-row justify-between gap-2">
                <input className='mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  type='text' 
                  defaultValue={profile?.user?.username}
                  name='new_username'
                  onChange={(event) => setNewUsername(event.target.value)}
                  required
                />
                <input className='mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  type='password' 
                  placeholder='Enter password' 
                  name='password' 
                  value={passwordUsername} 
                  onChange={(event) => setPasswordUsername(event.target.value)} 
                  required
                />
                {!usernameLoading ?
                  <button type='submit' className='w-1/5 px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200'>Submit</button>
                : (
                  <div className='text-white'>
                    <LoadingIcon />
                  </div>
                )}
              </div>
              {profile?.isSelf && <EditIcon onClick={() => { editField === "username" ? setEditField("") : setEditField("username") }} />}
            </form>
          </div>
        ) : (
          <div className="flex justify-between">
            <div className="flex gap-5">
              <p>Username :</p>
              <p className="font-bold">{profile?.user?.username}</p>
            </div>
            {profile?.isSelf && <EditIcon onClick={() => { editField === "username" ? setEditField("") : setEditField("username") }} />}
          </div>
        )}
			  <p className='text-red-500'>{usernameError}</p>
		  </div>
		  <div className='mb-5 bg-gray-200 text-gray-800 p-3 rounded-md'>
        <div className="flex justify-between">
          <div className="flex gap-5">
            <p>E-mail :</p>
            <p className="font-bold">{profile?.user?.email}</p>
          </div>
        </div>
		  </div>
      {profile?.isSelf && (
        <div className="mb-5 bg-gray-200 text-gray-800 p-3 rounded-md">
          {editField === "password" ? (
            <div>
              <h2 className="mb-2 text-gray-800 text-xl font-bold">Change your password</h2>
              <form onSubmit={handleSubmitPassword} className='flex justify-between gap-5'>
                <input className='mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                  type='password' 
                  placeholder='Current password' 
                  name='password' 
                  value={passwordPassword} 
                  onChange={(event) => setPasswordPassword(event.target.value)}
                  required
                />
                <input className='mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  type='password'
                  placeholder="New password"
                  name='new_password'
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
                <input className='mt-0 w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  type='password' 
                  placeholder="Confirm new password"
                  name='password'
                  value={passwordVerification} 
                  onChange={(event) => setPasswordVerification(event.target.value)}
                  required
                />
                <div>
                  {!passwordLoading ?
                    <button type='submit' className='px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200'>Submit</button>
                  : (
                    <div className='text-white'>
                      <LoadingIcon />
                    </div>
                  )}
                </div>
                {profile?.isSelf && <EditIcon onClick={() => { editField === "password" ? setEditField("") : setEditField("password") }} styleClass="w-1/5" />}
              </form>
            </div>
          ) : (
            <div className="flex justify-between">
              <p>Password</p>
              {profile?.isSelf && <EditIcon onClick={() => { editField === "password" ? setEditField("") : setEditField("password") }} />}
            </div>
          )}
			    <p className='text-red-500'>{passwordError}</p>
		    </div>
      )}
		</div>
  );
}

export default ProfileChanges;


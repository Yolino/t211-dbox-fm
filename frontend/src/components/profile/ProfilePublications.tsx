import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PROFILE_QUERY from "../../graphql/profileQuery.ts";
import ProfileChanges from './ProfileChanges.tsx';
import ProfileTile from "./ProfileTile.tsx";
import ProfileCommentTile from "./ProfileCommentTile.tsx";
import Alert from "../Alert.tsx";
import LoadingIcon from "../../svg/LoadingIcon.tsx";

interface ProfilePublicationsProps {
  username: string;
  defaultExpandedTile: number | null;
  onPublicationClick: () => void;
  onPlayAudio: (i: number) => void | null;
  isModerationContext: boolean;
}

const ProfilePublications = ({ username, defaultExpandedTile, onPublicationClick, onPlayAudio, isModerationContext=false }: ProfilePublicationsProps) => {
  const navigate = useNavigate();
  const [expandedTile, setExpandedTile] = useState(
    defaultExpandedTile || { tileId: null, tileType: null }
  );
  useEffect(() => {
    if (defaultExpandedTile?.tileId && (expandedTile?.tileId !== defaultExpandedTile.tileId || expandedTile?.tileType !== defaultExpandedTile.tileType)) {
      setExpandedTile(defaultExpandedTile);
    }
  }, [defaultExpandedTile]);
  const [message, setMessage] = useState({
    isError: false,
    text: "",
  });
  const { loading, error, data, refetch } = useQuery(PROFILE_QUERY, {
    variables: { username },
    onCompleted: (data) => {
      if (!data.profile.user) navigate("/", {state: { message: "This profile does not exist" }});
    },
    onError: () => {
      navigate("/", {state: { message: "This profile does not exist" }});
    },
  });

  const handleExpandTile = (i, t) => {
    (i === expandedTile?.tileId && t === expandedTile?.tileType) ? setExpandedTile({ tileId: null, tileType: null }) : setExpandedTile({tileId: i, tileType: t});
  }
  const refetchProfile = () => {
    refetch();
  };
  const profile = data?.profile;

  return (
    <div>
    {message.text && <Alert type={message.isError ? "error" : "success"} text={message.text} onClose={() => { setMessage({isError: false, text: ""}) }} />}
    <div className="text-center">
      <div className="flex justify-center items-center text-white space-x-4">
        <h1 className="text-3xl font-bold text-white cursor-default">User Profile {profile?.user?.username ? ` - ${profile.user.username}` : username ? ` - ${username}` : ""}</h1>
        {error && <p className="text-center text-red-500 cursor-default">{error.message}</p>}
        {profile?.isSelf && (
          <p className="mt-2 text-sm text-gray-400 cursor-default">This is your profile</p>
        )}
      </div>
    </div>
    <ProfileChanges profile={profile} />
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-white mb-4 cursor-default">
        {loading && <LoadingIcon />}
        Publications
      </h2>
      <ul className="space-y-4 mb-4">
        {profile?.publications.map((p, i) => (
          <ProfileTile
            key={i}
            author={profile.user.username}
            publication={p}
            index={i}
            isSelf={profile.isSelf}
            onEdit={() => { handleExpandTile(p.id, "publication"); }}
            onCloseTile={() => { handleExpandTile(null) }}
            isExpanded={profile.isSelf && p.id === expandedTile?.tileId && expandedTile?.tileType === "publication"}
            message={(i === message.tileId && message.tileType === "publication") ? {isError: message.isError, text: message.text} : null}
            onSetMessage={(m) => { setMessage(m) }}
            onProfileUpdate={refetchProfile}
            onPublicationClick={onPublicationClick}
            onPlayAudio={() => { onPlayAudio(p.id) }}
            isModerationContext={isModerationContext}
          />
        ))}
      </ul>
      <h2 className="text-2xl font-semibold text-white mb-4 cursor-default">
        {loading && <LoadingIcon />}
        Comments
      </h2>
      <ul className="space-y-4">
        {profile?.comments.map((c, i) => (
          <ProfileCommentTile
            key={i}
            comment={c}
            index={i}
            isSelf={profile.isSelf}
            onEdit={() => { handleExpandTile(c.id, "comment") }}
            onCloseTile={() => { handleExpandTile(null) }}
            isExpanded={profile.isSelf && c.id === expandedTile?.tileId && expandedTile?.tileType === "comment" }
            onSetMessage={(m) => { setMessage(m) }}
            onProfileUpdate={refetchProfile}
            onCommentClick={onPublicationClick}
          />
        ))}
      </ul>
    </div>
    </div>
  );
};

export default ProfilePublications;

import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { MockedProvider } from "@apollo/client/testing";
import Tile from "../Tile";
import CREATE_VOTE_MUTATION from "../../../graphql/createVoteMutation";
import UPDATE_VOTE_MUTATION from "../../../graphql/updateVoteMutation";
import DELETE_VOTE_MUTATION from "../../../graphql/deleteVoteMutation";

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

const mockUsePrivileges = jest.fn(() => ({
  privileges: {
    isLoggedIn: true
  }
}));

jest.mock('../../../svg/LoadingIcon.tsx', () => ({ styleClass }) => (
  <div data-testid="loading-icon" className={styleClass}>Loading...</div>
));

jest.mock('../../../svg/AudioIcon.tsx', () => ({ styleClass }) => (
  <div data-testid="audio-icon" className={styleClass}>Audio</div>
));

jest.mock('../../../svg/PlayIcon.tsx', () => () => (
  <div data-testid="play-icon">Play</div>
));

jest.mock('../../../svg/UpvoteIcon.tsx', () => () => (
  <div data-testid="upvote-icon">↑</div>
));

jest.mock('../../../svg/DownvoteIcon.tsx', () => () => (
  <div data-testid="downvote-icon">↓</div>
));

const mockPublication = {
  id: 1,
  title: "Test Publication",
  cover: null,
  voteCount: 42,
  visitorVote: 0,
  isBanned: false,
  author: { 
    username: "testuser",
    isActive: true
  },
};

const createUpvoteMock = {
  request: {
    query: CREATE_VOTE_MUTATION,
    variables: { publicationId: 1, voteType: 1 },
  },
  result: {
    data: {
      createVote: {
        voteCount: 43,
      },
    },
  },
};

const createDownvoteMock = {
  request: {
    query: CREATE_VOTE_MUTATION,
    variables: { publicationId: 1, voteType: -1 },
  },
  result: {
    data: {
      createVote: {
        voteCount: 41,
      },
    },
  },
};

const updateToDownvoteMock = {
  request: {
    query: UPDATE_VOTE_MUTATION,
    variables: { publicationId: 1, voteType: -1 },
  },
  result: {
    data: {
      updateVote: {
        voteCount: 41,
      },
    },
  },
};

const updateToUpvoteMock = {
  request: {
    query: UPDATE_VOTE_MUTATION,
    variables: { publicationId: 1, voteType: 1 },
  },
  result: {
    data: {
      updateVote: {
        voteCount: 43,
      },
    },
  },
};

const deleteVoteMock = {
  request: {
    query: DELETE_VOTE_MUTATION,
    variables: { publicationId: 1 },
  },
  result: {
    data: {
      deleteVote: {
        voteCount: 42,
      },
    },
  },
};

const createVoteErrorMock = {
  request: {
    query: CREATE_VOTE_MUTATION,
    variables: { publicationId: 1, voteType: 1 },
  },
  error: new Error("Create vote error"),
};

const updateVoteErrorMock = {
  request: {
    query: UPDATE_VOTE_MUTATION,
    variables: { publicationId: 1, voteType: -1 },
  },
  error: new Error("Update vote error"),
};

const deleteVoteErrorMock = {
  request: {
    query: DELETE_VOTE_MUTATION,
    variables: { publicationId: 1 },
  },
  error: new Error("Delete vote error"),
};

const renderTile = (publication = mockPublication, mocks = []) => {
  const props = {
    publication,
    group: "test-group",
    onPlayAudio: jest.fn(),
    onTileClick: jest.fn(),
    onTileVote: jest.fn(),
    onError: jest.fn(),
  };
  
  return {
    ...render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Tile {...props} />
      </MockedProvider>
    ),
    props
  };
};

const revealHoverElements = (element) => {
  fireEvent.mouseEnter(element.closest(".group"));
};

describe("Tile component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state when publication is null", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    renderTile(null);
    expect(screen.getByTestId("loading-icon")).toBeInTheDocument();
  });

  it("renders title, author, and vote count", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    renderTile();
    expect(screen.getByText("Test Publication")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("42 votes")).toBeInTheDocument();
  });

  it("renders singular 'vote' when count is 1", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const publicationWithOneVote = {
      ...mockPublication,
      voteCount: 1
    };
    renderTile(publicationWithOneVote);
    expect(screen.getByText("1 vote")).toBeInTheDocument();
  });

  it("renders image when publication has a cover", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const publicationWithCover = {
      ...mockPublication,
      cover: "/path/to/image.jpg"
    };
    renderTile(publicationWithCover);
    const image = screen.getByAltText("Cover for Test Publication");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "http://localhost:8000/path/to/image.jpg");
  });

  it("renders audio icon when publication has no cover", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    renderTile();
    const audioIcon = screen.getByTestId("audio-icon");
    expect(audioIcon).toBeInTheDocument();
    expect(audioIcon).toHaveClass("text-gray-800");
  });

  it("renders banned styling when publication is banned", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const bannedPublication = {
      ...mockPublication,
      isBanned: true
    };
    renderTile(bannedPublication);
    
    const tileContainer = screen.getByText("Test Publication").closest(".group");
    expect(tileContainer).toHaveClass("bg-red-200");
    expect(screen.getByText("Banned")).toBeInTheDocument();
    
    const audioIcon = screen.getByTestId("audio-icon");
    expect(audioIcon).toHaveClass("text-red-800");
  });

  it("renders banned author styling when author is not active", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const publicationWithBannedAuthor = {
      ...mockPublication,
      author: {
        username: "testuser",
        isActive: false
      }
    };
    renderTile(publicationWithBannedAuthor);
    
    const username = screen.getByText("testuser");
    expect(username).toHaveClass("bg-red-200");
    expect(screen.getByText("Banned")).toBeInTheDocument();
  });

  it("calls onTileClick with publication id when tile is clicked", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const { props } = renderTile();
    const tileContainer = screen.getByText("Test Publication").closest(".group");
    fireEvent.click(tileContainer);
    expect(props.onTileClick).toHaveBeenCalledWith(mockPublication.id);
  });

  it("calls onPlayAudio with publication id when play button is clicked", async () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const { props } = renderTile();
    const tileContainer = screen.getByText("Test Publication").closest(".group");
    revealHoverElements(tileContainer);
    
    const playButton = screen.getByLabelText("Play audio");
    fireEvent.click(playButton);
    expect(props.onPlayAudio).toHaveBeenCalledWith(mockPublication.id);
  });

  it("prevents event propagation when play button is clicked", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const { props } = renderTile();
    const tileContainer = screen.getByText("Test Publication").closest(".group");
    revealHoverElements(tileContainer);
    
    const playButton = screen.getByLabelText("Play audio");
    fireEvent.click(playButton);
    expect(props.onTileClick).toHaveBeenCalled();
  });

  it("shows green background for upvote button when already upvoted", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const upvotedPublication = {
      ...mockPublication,
      visitorVote: 1
    };
    const { container } = renderTile(upvotedPublication);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const upvoteButton = screen.getByTestId("upvote-icon").closest("button");
    expect(upvoteButton).toHaveClass("bg-green-500");
  });

  it("shows red background for downvote button when already downvoted", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const downvotedPublication = {
      ...mockPublication,
      visitorVote: -1
    };
    const { container } = renderTile(downvotedPublication);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const downvoteButton = screen.getByTestId("downvote-icon").closest("button");
    expect(downvoteButton).toHaveClass("bg-red-500");
  });

  it("shows error when not logged in and trying to vote", () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: false }
    });

    const { props, container } = renderTile();
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const upvoteButton = screen.getByTestId("upvote-icon").closest("button");
    fireEvent.click(upvoteButton);
    
    expect(props.onError).toHaveBeenCalledWith("You must be logged in to submit votes");
    expect(props.onTileVote).not.toHaveBeenCalled();
  });

  it("creates an upvote when neutral and upvote button is clicked", async () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const { props, container } = renderTile(mockPublication, [createUpvoteMock]);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const upvoteButton = screen.getByTestId("upvote-icon").closest("button");
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
    expect(props.onError).toHaveBeenCalledWith("");
  });

  it("creates a downvote when neutral and downvote button is clicked", async () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const { props, container } = renderTile(mockPublication, [createDownvoteMock]);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const downvoteButton = screen.getByTestId("downvote-icon").closest("button");
    fireEvent.click(downvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
    expect(props.onError).toHaveBeenCalledWith("");
  });

  it("removes vote when upvoted and upvote button is clicked again", async () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const upvotedPublication = {
      ...mockPublication,
      visitorVote: 1
    };
    const { props, container } = renderTile(upvotedPublication, [deleteVoteMock]);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const upvoteButton = screen.getByTestId("upvote-icon").closest("button");
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
  });

  it("updates to downvote when upvoted and downvote button is clicked", async () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const upvotedPublication = {
      ...mockPublication,
      visitorVote: 1
    };
    const { props, container } = renderTile(upvotedPublication, [updateToDownvoteMock]);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const downvoteButton = screen.getByTestId("downvote-icon").closest("button");
    fireEvent.click(downvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
  });

  it("removes vote when downvoted and downvote button is clicked again", async () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const downvotedPublication = {
      ...mockPublication,
      visitorVote: -1
    };
    const { props, container } = renderTile(downvotedPublication, [deleteVoteMock]);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const downvoteButton = screen.getByTestId("downvote-icon").closest("button");
    fireEvent.click(downvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
  });

  it("updates to upvote when downvoted and upvote button is clicked", async () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const downvotedPublication = {
      ...mockPublication,
      visitorVote: -1
    };
    const { props, container } = renderTile(downvotedPublication, [updateToUpvoteMock]);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const upvoteButton = screen.getByTestId("upvote-icon").closest("button");
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
  });

  it("handles error when creating upvote", async () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const { props, container } = renderTile(mockPublication, [createVoteErrorMock]);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const upvoteButton = screen.getByTestId("upvote-icon").closest("button");
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(props.onError).toHaveBeenCalledWith("Create vote error");
    });
  });

  it("handles error when updating vote", async () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const upvotedPublication = {
      ...mockPublication,
      visitorVote: 1
    };
    const { props, container } = renderTile(upvotedPublication, [updateVoteErrorMock]);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const downvoteButton = screen.getByTestId("downvote-icon").closest("button");
    fireEvent.click(downvoteButton);
    
    await waitFor(() => {
      expect(props.onError).toHaveBeenCalledWith("Update vote error");
    });
  });

  it("handles error when deleting vote", async () => {
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });
    const upvotedPublication = {
      ...mockPublication,
      visitorVote: 1
    };
    const { props, container } = renderTile(upvotedPublication, [deleteVoteErrorMock]);
    const tileContainer = container.querySelector(".group");
    revealHoverElements(tileContainer);
    
    const upvoteButton = screen.getByTestId("upvote-icon").closest("button");
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(props.onError).toHaveBeenCalledWith("Delete vote error");
    });
  });

  it("calls navigate when author username is clicked", () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });

    renderTile();
    const usernameElement = screen.getByText("testuser");
    fireEvent.click(usernameElement);
    
    expect(navigateMock).toHaveBeenCalledWith("/profile/testuser");
  });

  it("prevents event propagation when username is clicked", () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);
    jest.spyOn(require('../../../context/PrivilegesContext.tsx'), 'usePrivileges').mockReturnValue({
      privileges: { isLoggedIn: true }
    });

    const { props } = renderTile();
    const usernameElement = screen.getByText("testuser");
    fireEvent.click(usernameElement);
    
    expect(navigateMock).toHaveBeenCalledWith("/profile/testuser");
    expect(props.onTileClick).not.toHaveBeenCalled();
  });
});

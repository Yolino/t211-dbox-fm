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

const mockPublication = {
  id: 1,
  title: "Test Publication",
  cover: null,
  voteCount: 42,
  visitorVote: 0,
  author: { username: "testuser" },
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
  fireEvent.mouseOver(element.closest(".group"));
};

describe("Tile component", () => {
  it("renders title, author, and vote count", () => {
    renderTile();
    expect(screen.getByText("Test Publication")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("42 votes")).toBeInTheDocument();
  });

  it("renders image when publication has a cover", () => {
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
    renderTile();
    const audioIcon = screen.getByTestId("audio-icon");
    expect(audioIcon).toHaveClass("w-12 h-12 text-gray-800");
  });

  it("calls onTileClick when tile is clicked", () => {
    const { props } = renderTile();
    const tileContainer = screen.getByText("Test Publication").closest(".group");
    fireEvent.click(tileContainer);
    expect(props.onTileClick).toHaveBeenCalledWith(mockPublication.id, "test-group");
  });

  it("calls onPlayAudio when play button is clicked", async () => {
    const { props } = renderTile();
    const playButton = screen.getByRole("button", { name: /play audio/i });
    revealHoverElements(playButton);
    fireEvent.click(playButton);
    expect(props.onPlayAudio).toHaveBeenCalledWith({
      id: mockPublication.id,
      title: mockPublication.title,
      author: mockPublication.author.username,
    });
  });

  it("prevents event propagation when play button is clicked", () => {
    const { props } = renderTile();
    const playButton = screen.getByRole("button", { name: /play audio/i });
    revealHoverElements(playButton);
    fireEvent.click(playButton);
    expect(props.onTileClick).not.toHaveBeenCalled();
  });

  it("shows green background for upvote button when already upvoted", () => {
    const upvotedPublication = {
      ...mockPublication,
      visitorVote: 1
    };
    renderTile(upvotedPublication);
    const upvoteButton = screen.getByRole("button", { name: /upvote/i });
    revealHoverElements(upvoteButton);
    expect(upvoteButton).toHaveClass("bg-green-300");
  });

  it("shows red background for downvote button when already downvoted", () => {
    const downvotedPublication = {
      ...mockPublication,
      visitorVote: -1
    };
    renderTile(downvotedPublication);
    const downvoteButton = screen.getByRole("button", { name: /downvote/i });
    revealHoverElements(downvoteButton);
    expect(downvoteButton).toHaveClass("bg-red-300");
  });

  it("creates an upvote when neutral and upvote button is clicked", async () => {
    const { props } = renderTile(mockPublication, [createUpvoteMock]);
    const upvoteButton = screen.getByRole("button", { name: /upvote/i });
    revealHoverElements(upvoteButton);
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
    expect(props.onError).toHaveBeenCalledWith("");
  });

  it("creates a downvote when neutral and downvote button is clicked", async () => {
    const { props } = renderTile(mockPublication, [createDownvoteMock]);
    const downvoteButton = screen.getByRole("button", { name: /downvote/i });
    revealHoverElements(downvoteButton);
    fireEvent.click(downvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
    expect(props.onError).toHaveBeenCalledWith("");
  });

  it("removes vote when upvoted and upvote button is clicked again", async () => {
    const upvotedPublication = {
      ...mockPublication,
      visitorVote: 1
    };
    const { props } = renderTile(upvotedPublication, [deleteVoteMock]);
    const upvoteButton = screen.getByRole("button", { name: /upvote/i });
    revealHoverElements(upvoteButton);
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
  });

  it("updates to downvote when upvoted and downvote button is clicked", async () => {
    const upvotedPublication = {
      ...mockPublication,
      visitorVote: 1
    };
    const { props } = renderTile(upvotedPublication, [updateToDownvoteMock]);
    const downvoteButton = screen.getByRole("button", { name: /downvote/i });
    revealHoverElements(downvoteButton);
    fireEvent.click(downvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
  });

  it("removes vote when downvoted and downvote button is clicked again", async () => {
    const downvotedPublication = {
      ...mockPublication,
      visitorVote: -1
    };
    const { props } = renderTile(downvotedPublication, [deleteVoteMock]);
    const downvoteButton = screen.getByRole("button", { name: /downvote/i });
    revealHoverElements(downvoteButton);
    fireEvent.click(downvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
  });

  it("updates to upvote when downvoted and upvote button is clicked", async () => {
    const downvotedPublication = {
      ...mockPublication,
      visitorVote: -1
    };
    const { props } = renderTile(downvotedPublication, [updateToUpvoteMock]);
    const upvoteButton = screen.getByRole("button", { name: /upvote/i });
    revealHoverElements(upvoteButton);
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(props.onTileVote).toHaveBeenCalled();
    });
  });

  it("handles error when creating upvote", async () => {
    const { props } = renderTile(mockPublication, [createVoteErrorMock]);
    const upvoteButton = screen.getByRole("button", { name: /upvote/i });
    revealHoverElements(upvoteButton);
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(props.onError).toHaveBeenCalledWith("Create vote error");
    });
  });

  it("handles error when updating vote", async () => {
    const upvotedPublication = {
      ...mockPublication,
      visitorVote: 1
    };
    const { props } = renderTile(upvotedPublication, [updateVoteErrorMock]);
    const downvoteButton = screen.getByRole("button", { name: /downvote/i });
    revealHoverElements(downvoteButton);
    fireEvent.click(downvoteButton);
    
    await waitFor(() => {
      expect(props.onError).toHaveBeenCalledWith("Update vote error");
    });
  });

  it("handles error when deleting vote", async () => {
    const upvotedPublication = {
      ...mockPublication,
      visitorVote: 1
    };
    const { props } = renderTile(upvotedPublication, [deleteVoteErrorMock]);
    const upvoteButton = screen.getByRole("button", { name: /upvote/i });
    revealHoverElements(upvoteButton);
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(props.onError).toHaveBeenCalledWith("Delete vote error");
    });
  });

  it("calls navigate when author username is clicked", () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);
    
    renderTile();
    const usernameElement = screen.getByText("testuser");
    fireEvent.click(usernameElement);
    
    expect(navigateMock).toHaveBeenCalledWith("/profile/testuser");
  });
});

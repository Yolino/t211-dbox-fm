import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import Tile from "../Tile";
import CREATE_VOTE_MUTATION from "../../../graphql/createVoteMutation.ts";
import UPDATE_VOTE_MUTATION from "../../../graphql/updateVoteMutation.ts";
import DELETE_VOTE_MUTATION from "../../../graphql/deleteVoteMutation.ts";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

const mockPublication = {
  id: 123,
  title: "Test Publication Title",
  cover: "/path/to/cover.jpg",
  voteCount: 42,
  author: { username: "testuser" },
  visitorVote: 0,
};

const mockProps = {
  publication: mockPublication,
  group: "test-group",
  onPlayAudio: jest.fn(),
  onTileClick: jest.fn(),
  onTileVote: jest.fn(),
  onError: jest.fn(),
};

const createVoteMutationMock = {
  request: {
    query: CREATE_VOTE_MUTATION,
    variables: { publicationId: mockPublication.id, voteType: 1 },
  },
  result: {
    data: {
      createVote: {
        voteCount: 43,
      },
    },
  },
};

const updateVoteMutationMock = {
  request: {
    query: UPDATE_VOTE_MUTATION,
    variables: { publicationId: mockPublication.id, voteType: -1 },
  },
  result: {
    data: {
      updateVote: {
        voteCount: 41,
      },
    },
  },
};

const deleteVoteMutationMock = {
  request: {
    query: DELETE_VOTE_MUTATION,
    variables: { publicationId: mockPublication.id },
  },
  result: {
    data: {
      deleteVote: {
        voteCount: 41,
      },
    },
  },
};

const errorMutationMock = {
  request: {
    query: CREATE_VOTE_MUTATION,
    variables: { publicationId: mockPublication.id, voteType: 1 },
  },
  error: new Error("An error occurred during voting"),
};

describe("Tile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders publication details correctly", () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Tile {...mockProps} />
      </MockedProvider>
    );

    expect(screen.getByText("Test Publication Title")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("42 votes")).toBeInTheDocument();
  });

  test("renders audio icon when no cover is provided", () => {
    const noImagePublication = {
      ...mockPublication,
      cover: null,
    };

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Tile {...mockProps} publication={noImagePublication} />
      </MockedProvider>
    );

    const audioIconContainer = screen.getByRole("generic");
    expect(audioIconContainer).toBeInTheDocument();
  });

  test("calls onTileClick when the tile is clicked", () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Tile {...mockProps} />
      </MockedProvider>
    );

    const tile = screen.getByText("Test Publication Title").closest("div");
    fireEvent.click(tile);

    expect(mockProps.onTileClick).toHaveBeenCalledWith(mockPublication.id, "test-group");
  });

  test("calls onPlayAudio when play button is clicked", () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Tile {...mockProps} />
      </MockedProvider>
    );

    const playButton = screen.getByRole("button");
    fireEvent.click(playButton);

    expect(mockProps.onPlayAudio).toHaveBeenCalledWith({
      id: mockPublication.id,
      title: mockPublication.title,
      author: mockPublication.author.username,
    });
  });

  test("handles upvote correctly with createVote mutation", async () => {
    render(
      <MockedProvider mocks={[createVoteMutationMock]} addTypename={false}>
        <Tile {...mockProps} />
      </MockedProvider>
    );

    const buttons = screen.getAllByRole("button");
    const upvoteButton = buttons[1];   
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(mockProps.onTileVote).toHaveBeenCalled();
    });
  });

  test("handles error in mutation correctly", async () => {
    render(
      <MockedProvider mocks={[errorMutationMock]} addTypename={false}>
        <Tile {...mockProps} />
      </MockedProvider>
    );

    const buttons = screen.getAllByRole("button");
    const upvoteButton = buttons[1];
    
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(mockProps.onError).toHaveBeenCalledWith("An error occurred during voting");
    });
  });

  test("handles downvote correctly", async () => {
    render(
      <MockedProvider mocks={[createVoteMutationMock]} addTypename={false}>
        <Tile {...mockProps} />
      </MockedProvider>
    );

    const buttons = screen.getAllByRole("button");
    const downvoteButton = buttons[2];
    
    fireEvent.click(downvoteButton);
    
    expect(mockProps.onError).toHaveBeenCalledWith("");
  });

  test("handles updating vote when already voted", async () => {
    const publicationWithVote = {
      ...mockPublication,
      visitorVote: 1, // User already upvoted
    };

    render(
      <MockedProvider mocks={[deleteVoteMutationMock]} addTypename={false}>
        <Tile 
          {...mockProps} 
          publication={publicationWithVote}
        />
      </MockedProvider>
    );

    const buttons = screen.getAllByRole("button");
    const upvoteButton = buttons[1];
    
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(mockProps.onTileVote).toHaveBeenCalled();
    });
  });

  test("displays upvote button with green background when already upvoted", () => {
    const publicationWithUpvote = {
      ...mockPublication,
      visitorVote: 1,
    };

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Tile 
          {...mockProps} 
          publication={publicationWithUpvote}
        />
      </MockedProvider>
    );

    const buttons = screen.getAllByRole("button");
    const upvoteButton = buttons[1];
    
    expect(upvoteButton).toHaveClass("bg-green-300");
  });

  test("displays downvote button with red background when already downvoted", () => {
    const publicationWithDownvote = {
      ...mockPublication,
      visitorVote: -1,
    };

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Tile 
          {...mockProps} 
          publication={publicationWithDownvote}
        />
      </MockedProvider>
    );

    const buttons = screen.getAllByRole("button");
    const downvoteButton = buttons[2];
    
    expect(downvoteButton).toHaveClass("bg-red-300");
  });
});

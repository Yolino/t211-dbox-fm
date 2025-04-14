import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import Tile from "../Tile.tsx";
import CREATE_VOTE_MUTATION from "../../../graphql/createVoteMutation";
import UPDATE_VOTE_MUTATION from "../../../graphql/updateVoteMutation";
import DELETE_VOTE_MUTATION from "../../../graphql/deleteVoteMutation";
jest.mock('react-router-dom');

const mockPublication = {
  id: 1,
  title: "Test Publication",
  cover: null,
  voteCount: 42,
  visitorVote: 0,
  author: { username: "testuser" },
};

const renderTile = (overrides = {}) => {
  const props = {
    publication: mockPublication,
    group: "test-group",
    onPlayAudio: jest.fn(),
    onTileClick: jest.fn(),
    onTileVote: jest.fn(),
    onError: jest.fn(),
    ...overrides,
  };
  
  return render(
    <MockedProvider mocks={[]} addTypename={false}>
      <Tile {...props} />
    </MockedProvider>
  );
};

describe("Tile component", () => {
  it("renders title, author, and vote count", () => {
    renderTile();
    expect(screen.getByText("Test Publication")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("42 votes")).toBeInTheDocument();
  });

  it("calls onTileClick when tile is clicked", () => {
    const onTileClick = jest.fn();
    renderTile({ onTileClick });
    fireEvent.click(screen.getByText("Test Publication"));
    expect(onTileClick).toHaveBeenCalledWith(mockPublication.id, "test-group");
  });

  it("calls onPlayAudio when play button is clicked", () => {
    const onPlayAudio = jest.fn();
    renderTile({ onPlayAudio });
    fireEvent.click(screen.getByRole("button"));
    expect(onPlayAudio).toHaveBeenCalledWith({
      id: mockPublication.id,
      title: mockPublication.title,
      author: mockPublication.author.username,
    });
  });

  it("calls onError when a mutation fails", async () => {
    const onError = jest.fn();
    const mocks = [
      {
        request: {
          query: CREATE_VOTE_MUTATION,
          variables: { publicationId: mockPublication.id, voteType: 1 },
        },
        error: new Error("Mock error"),
      },
    ];
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Tile
          publication={mockPublication}
          group="test-group"
          onPlayAudio={() => {}}
          onTileClick={() => {}}
          onTileVote={() => {}}
          onError={onError}
        />
      </MockedProvider>
    );
    const upvoteButton = screen.getAllByRole("button")[1];
    fireEvent.click(upvoteButton);
    await new Promise((res) => setTimeout(res, 0));
    expect(onError).toHaveBeenCalledWith("Mock error");
  });
});

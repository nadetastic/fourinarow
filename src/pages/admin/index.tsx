import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";

type Game = {
  code: { S: string };
  player1: { S: string };
  player2?: { S: string };
};

export default function AdminPanel() {
  const [games, setGames] = useState<Array<Game>>();
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const f = await fetchAuthSession();
        console.log(f);
        const ddbClient = new DynamoDBClient({
          credentials: f.credentials,
          region: "us-east-1",
        });

        const { Items } = await ddbClient.send(
          new ScanCommand({ TableName: "FourInARowGameData" })
        );
        console.log(Items);
        setGames(Items as Array<Game>);

        // setGeneratedCode(newCode);
      } catch (err) {
        console.log(err);
      }
    };

    fetchGames();
  }, []);
  return (
    <div>
      <pre>{JSON.stringify(games, null, 2)}</pre>
      {games &&
        games.map((game, id) => {
          return <div key={id}>{game.code.S}</div>;
        })}
    </div>
  );
}

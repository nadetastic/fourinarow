"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

function generateShortCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default function StartGameComponent() {
  const { user } = useAuthenticator((context) => [context.user]);

  const [shortCode, setShortCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [screenName, setScreenName] = useState(user.signInDetails?.loginId);
  const router = useRouter();

  const handleGenerateCode = async () => {
    const newCode = generateShortCode();

    try {
      const f = await fetchAuthSession();
      console.log(f);
      const ddbClient = new DynamoDBClient({
        credentials: f.credentials,
        region: "us-east-1",
      });

      const res = await ddbClient.send(
        new ScanCommand({ TableName: "FourInARowGameData" })
      );
      console.log(res);

      setGeneratedCode(newCode);
    } catch (err) {
      console.log(err);
    }
  };

  const handleStartGame = async (code: string) => {
    if (code && screenName) {
      try {
        const f = await fetchAuthSession();
        console.log(f);
        const ddbClient = new DynamoDBClient({
          credentials: f.credentials,
          region: "us-east-1",
        });

        const res = await ddbClient.send(
          new PutItemCommand({
            TableName: "FourInARowGameData",
            Item: {
              code: {
                S: code,
              },
              player1: {
                S: screenName,
              },
            },
          })
        );
        console.log(res);

        router.push(
          `/game/${code}?player=${encodeURIComponent(screenName)}&creator=true`
        );
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleJoinGame = async (code: string) => {
    if (code && screenName) {
      try {
        const f = await fetchAuthSession();
        console.log(f);
        const ddbClient = new DynamoDBClient({
          credentials: f.credentials,
          region: "us-east-1",
        });

        const res = await ddbClient.send(
          new UpdateItemCommand({
            TableName: "FourInARowGameData",
            Key: {
              code: {
                S: code,
              },
            },
            ExpressionAttributeNames: {
              "#P2": "player2",
            },
            ExpressionAttributeValues: {
              ":player2": {
                S: screenName,
              },
            },
            UpdateExpression: "SET #P2 = :player2",
          })
        );
        console.log(res);

        router.push(
          `/game/${code}?player=${encodeURIComponent(screenName)}&creator=false`
        );
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-100 pt-8">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Start a Four In A Row Game</CardTitle>
          <CardDescription>
            Enter your screen name and generate a new game or join an existing
            one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="screen-name">Screen Name</Label>
              <Input
                id="screen-name"
                placeholder="Enter your screen name"
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
              />
            </div>
            <div>
              <Button onClick={handleGenerateCode} className="w-full mb-2">
                Generate New Game Code
              </Button>
              {generatedCode && (
                <div className="text-center">
                  <p className="mb-2">Your game code:</p>
                  <p className="font-bold text-2xl">{generatedCode}</p>
                  <Button
                    onClick={() => handleStartGame(generatedCode)}
                    className="mt-2"
                    disabled={!screenName}
                  >
                    Start New Game
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="game-code">Join Existing Game</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="game-code"
                  placeholder="Enter game code"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
                <Button
                  onClick={() => handleJoinGame(shortCode)}
                  disabled={!screenName || !shortCode}
                >
                  Join Game
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  type BoardGameWithLocation,
  difficultyLabels,
  difficultyColors,
} from "@/lib/schemas";

interface GameCardProps {
  game: BoardGameWithLocation;
  actions?: React.ReactNode;
}

export function GameCard({ game, actions }: GameCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold leading-tight">
              {game.name}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {game.shelf?.room?.name ?? "Cuarto desconocido"} —{" "}
                {game.shelf?.name ?? "Estante desconocido"}
              </span>
            </p>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={difficultyColors[game.difficulty]}
          >
            {difficultyLabels[game.difficulty]}
          </Badge>
          {game.minPlayers && game.maxPlayers ? (
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {game.minPlayers}-{game.maxPlayers} jugadores
            </Badge>
          ) : null}
          {game.durationMinutes ? (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {game.durationMinutes} min
            </Badge>
          ) : null}
          {game.minAge ? (
            <Badge variant="outline">+{game.minAge} años</Badge>
          ) : null}
        </div>

        {game.notes ? (
          <p className="mt-3 text-sm text-muted-foreground">{game.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

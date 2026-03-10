import { useHomeStore } from '@/stores/useHomeStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, MapPin, Calendar } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

const Trips = () => {
  const { trips } = useHomeStore();

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trips</h1>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16">
          <Plane className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No trips planned yet</p>
          <p className="text-xs text-muted-foreground mt-1">Trip planning coming in a future update!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => {
            const daysUntil = differenceInDays(parseISO(trip.startDate), new Date());
            return (
              <motion.div key={trip.id} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Card className="overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                    <Plane className="h-8 w-8 text-primary" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{trip.title}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {trip.destination}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(trip.startDate), 'MMM d')} — {format(parseISO(trip.endDate), 'MMM d')}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {daysUntil <= 0 ? 'Now!' : `${daysUntil}d`}
                      </Badge>
                    </div>
                    {trip.description && (
                      <p className="text-xs text-muted-foreground mt-2 font-serif-content">{trip.description}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Trips;

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TravelPreferencesProps {
  zipCode: string;
  maxTravelDistance: number | null;
  onZipCodeChange: (value: string) => void;
  onDistanceChange: (value: number | null) => void;
}

const distanceOptions = [
  { value: 25, label: "25 miles" },
  { value: 50, label: "50 miles" },
  { value: 100, label: "100 miles" },
  { value: 250, label: "250 miles" },
  { value: -1, label: "Any distance" },
];

export function TravelPreferences({
  zipCode,
  maxTravelDistance,
  onZipCodeChange,
  onDistanceChange,
}: TravelPreferencesProps) {
  const handleDistanceChange = (value: string) => {
    const numValue = parseInt(value, 10);
    onDistanceChange(numValue === -1 ? null : numValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Travel Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Help us find trials near you
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode" className="text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Your ZIP Code
          </Label>
          <Input
            id="zipCode"
            type="text"
            placeholder="Enter your ZIP code"
            value={zipCode}
            onChange={(e) => {
              // Only allow numbers and limit to 5 digits
              const value = e.target.value.replace(/\D/g, "").slice(0, 5);
              onZipCodeChange(value);
            }}
            className="h-12 max-w-xs"
            maxLength={5}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-foreground">Maximum Travel Distance</Label>
          <RadioGroup
            value={
              maxTravelDistance === null
                ? "-1"
                : String(maxTravelDistance)
            }
            onValueChange={handleDistanceChange}
            className="grid grid-cols-2 md:grid-cols-5 gap-3"
          >
            {distanceOptions.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={String(option.value)}
                  id={`distance-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`distance-${option.value}`}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    (maxTravelDistance === null && option.value === -1) ||
                    maxTravelDistance === option.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-card hover:border-primary/50 text-foreground"
                  }`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </motion.div>
  );
}

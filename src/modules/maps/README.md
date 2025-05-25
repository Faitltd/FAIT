# Maps & Location Module

The Maps & Location module handles location-based services and mapping for the FAIT Co-op platform.

## Features

- Google Maps integration
- Service area management
- Location search
- Directions
- Address autocomplete
- Geolocation
- Distance calculation
- Marker clustering
- Custom map styling
- Location saving

## Directory Structure

```
/maps
  /components
    /map            # Map display components
    /search         # Location search components
    /directions     # Directions components
    /autocomplete   # Address autocomplete components
    /areas          # Service area components
    /markers        # Map marker components
  /hooks            # Maps-related hooks
  /services         # Maps API services
  /types            # Maps type definitions
  /utils            # Maps utility functions
  /contexts         # Maps context providers
  index.ts          # Public API exports
```

## Usage

Import components and utilities from the Maps & Location module:

```typescript
import { MapDisplay } from '@/modules/maps/components/map';
import { LocationSearch } from '@/modules/maps/components/search';
import { DirectionsMap } from '@/modules/maps/components/directions';
import { AddressAutocomplete } from '@/modules/maps/components/autocomplete';
```

## Map Display

The Maps & Location module provides components for displaying maps:

```typescript
import { MapDisplay } from '@/modules/maps/components/map';

function ServiceAreaMap({ serviceAgentId }) {
  return <MapDisplay serviceAgentId={serviceAgentId} />;
}
```

## Location Search

Search for locations and services by area:

```typescript
import { LocationSearch } from '@/modules/maps/components/search';

function ServiceSearchPage() {
  return <LocationSearch />;
}
```

## Directions

Display directions between locations:

```typescript
import { DirectionsMap } from '@/modules/maps/components/directions';

function DirectionsPage({ origin, destination }) {
  return <DirectionsMap origin={origin} destination={destination} />;
}
```

## Address Autocomplete

Autocomplete address input:

```typescript
import { AddressAutocomplete } from '@/modules/maps/components/autocomplete';

function AddressForm() {
  const [address, setAddress] = useState('');
  
  return (
    <AddressAutocomplete
      value={address}
      onChange={setAddress}
      placeholder="Enter your address"
    />
  );
}
```

## Service Areas

Manage and display service areas:

```typescript
import { ServiceAreaEditor } from '@/modules/maps/components/areas';

function ServiceAreaPage() {
  return <ServiceAreaEditor />;
}
```

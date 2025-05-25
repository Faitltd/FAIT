# Estimation Module

The Estimation module handles service estimation and pricing tools for the FAIT Co-op platform.

## Features

- Remodeling calculator
- Handyman task estimator
- Proposal generator
- Scope of work generator
- Estimate builder
- Good/Better/Best tiered pricing
- Material cost estimation
- Labor cost estimation
- Estimate comparison
- Estimate sharing

## Directory Structure

```
/estimation
  /components
    /calculator     # Calculator components
    /estimator      # Estimator components
    /proposal       # Proposal generator components
    /scope          # Scope of work components
    /builder        # Estimate builder components
    /comparison     # Estimate comparison components
  /hooks            # Estimation-related hooks
  /services         # Estimation API services
  /types            # Estimation type definitions
  /utils            # Estimation utility functions
  /contexts         # Estimation context providers
  index.ts          # Public API exports
```

## Usage

Import components and utilities from the Estimation module:

```typescript
import { RemodelingCalculator } from '@/modules/estimation/components/calculator';
import { HandymanEstimator } from '@/modules/estimation/components/estimator';
import { ProposalGenerator } from '@/modules/estimation/components/proposal';
import { ScopeOfWorkGenerator } from '@/modules/estimation/components/scope';
```

## Remodeling Calculator

The Estimation module provides a calculator for remodeling projects:

```typescript
import { RemodelingCalculator } from '@/modules/estimation/components/calculator';

function RemodelingCalculatorPage() {
  return <RemodelingCalculator />;
}
```

## Handyman Task Estimator

Estimate costs for handyman tasks:

```typescript
import { HandymanEstimator } from '@/modules/estimation/components/estimator';

function HandymanEstimatorPage() {
  return <HandymanEstimator />;
}
```

## Proposal Generator

Generate proposals based on estimates:

```typescript
import { ProposalGenerator } from '@/modules/estimation/components/proposal';

function ProposalPage({ estimateId }) {
  return <ProposalGenerator estimateId={estimateId} />;
}
```

## Scope of Work Generator

Generate scope of work documents:

```typescript
import { ScopeOfWorkGenerator } from '@/modules/estimation/components/scope';

function ScopeOfWorkPage({ estimateId }) {
  return <ScopeOfWorkGenerator estimateId={estimateId} />;
}
```

## Estimate Builder

Build detailed estimates:

```typescript
import { EstimateBuilder } from '@/modules/estimation/components/builder';

function BuildEstimatePage({ bookingId }) {
  return <EstimateBuilder bookingId={bookingId} />;
}
```

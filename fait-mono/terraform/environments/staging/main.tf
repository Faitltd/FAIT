provider "google" {
  project = var.project_id
  region  = var.region
}

module "cloud_run" {
  source = "../../modules/cloud-run"

  project_id         = var.project_id
  region             = var.region
  environment        = "staging"
  container_registry = "gcr.io"

  apps = {
    "fait-coop" = {
      cpu            = "1000m"
      memory         = "512Mi"
      container_port = 8080
      min_instances  = 1
      max_instances  = 5
      concurrency    = 80
      domain         = "coop.staging.fait.coop"
      image_tag      = "latest"
      environment_variables = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "VITE_SUPABASE_URL"
          value = var.supabase_url
        },
        {
          name  = "VITE_SUPABASE_ANON_KEY"
          value = var.supabase_anon_key
        }
      ]
    },
    "offershield" = {
      cpu            = "1000m"
      memory         = "512Mi"
      container_port = 8080
      min_instances  = 1
      max_instances  = 5
      concurrency    = 80
      domain         = "offer.staging.fait.coop"
      image_tag      = "latest"
      environment_variables = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "NEXT_PUBLIC_SUPABASE_URL"
          value = var.supabase_url
        },
        {
          name  = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
          value = var.supabase_anon_key
        },
        {
          name  = "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
          value = var.stripe_publishable_key
        }
      ]
    },
    "home-health-score" = {
      cpu            = "1000m"
      memory         = "512Mi"
      container_port = 8080
      min_instances  = 1
      max_instances  = 5
      concurrency    = 80
      domain         = "score.staging.fait.coop"
      image_tag      = "latest"
      environment_variables = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "NEXT_PUBLIC_SUPABASE_URL"
          value = var.supabase_url
        },
        {
          name  = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
          value = var.supabase_anon_key
        }
      ]
    },
    "handyman-calculator" = {
      cpu            = "1000m"
      memory         = "512Mi"
      container_port = 8080
      min_instances  = 1
      max_instances  = 5
      concurrency    = 80
      domain         = "handy.staging.fait.coop"
      image_tag      = "latest"
      environment_variables = [
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]
    },
    "flippercalc" = {
      cpu            = "1000m"
      memory         = "512Mi"
      container_port = 8080
      min_instances  = 1
      max_instances  = 5
      concurrency    = 80
      domain         = "flipper.staging.fait.coop"
      image_tag      = "latest"
      environment_variables = [
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]
    },
    "remodeling-calculator" = {
      cpu            = "1000m"
      memory         = "512Mi"
      container_port = 8080
      min_instances  = 1
      max_instances  = 5
      concurrency    = 80
      domain         = "remodel.staging.fait.coop"
      image_tag      = "latest"
      environment_variables = [
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]
    }
  }
}

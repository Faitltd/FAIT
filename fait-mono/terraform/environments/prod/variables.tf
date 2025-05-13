variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
  default     = "fait-444705"
}

variable "region" {
  description = "The Google Cloud region"
  type        = string
  default     = "us-central1"
}

variable "supabase_url" {
  description = "The Supabase URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "The Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "stripe_publishable_key" {
  description = "The Stripe publishable key"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "The Stripe secret key"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "The Google client ID"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "The JWT secret"
  type        = string
  sensitive   = true
}

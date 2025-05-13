<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import Avatar from '../components/ui/Avatar.vue'
import Badge from '../components/ui/Badge.vue'

// Community forum posts
const posts = ref([
  {
    id: 1,
    title: 'Recommendations for a reliable plumber in Denver?',
    content: 'I need to fix a leaky pipe in my bathroom. Has anyone worked with a good plumber in the Denver area recently? Looking for someone reliable and reasonably priced.',
    author: {
      name: 'Sarah Johnson',
      avatar: '',
      role: 'client'
    },
    date: '2023-06-15',
    comments: 8,
    likes: 12,
    tags: ['recommendation', 'plumbing']
  },
  {
    id: 2,
    title: 'Tips for winterizing your home',
    content: 'Winter is coming! I\'ve put together some tips for preparing your home for the cold months. From insulating pipes to sealing windows, these steps can save you money and prevent damage.',
    author: {
      name: 'Michael Rodriguez',
      avatar: '',
      role: 'service_agent'
    },
    date: '2023-06-10',
    comments: 15,
    likes: 24,
    tags: ['tips', 'winter', 'maintenance']
  },
  {
    id: 3,
    title: 'Before and after: Kitchen renovation project',
    content: 'Just finished a complete kitchen renovation through FAIT Co-op. I\'m sharing some before and after photos, along with lessons learned during the process.',
    author: {
      name: 'Emily Chen',
      avatar: '',
      role: 'client'
    },
    date: '2023-06-05',
    comments: 22,
    likes: 45,
    tags: ['renovation', 'kitchen', 'project']
  },
  {
    id: 4,
    title: 'Upcoming community workshop: Basic home repairs',
    content: 'I\'m hosting a workshop next month on basic home repairs that every homeowner should know. We\'ll cover fixing leaky faucets, patching drywall, and more. Let me know if you\'re interested!',
    author: {
      name: 'David Wilson',
      avatar: '',
      role: 'service_agent'
    },
    date: '2023-06-01',
    comments: 18,
    likes: 32,
    tags: ['workshop', 'education', 'repairs']
  },
  {
    id: 5,
    title: 'Solar panel installation experience',
    content: 'We recently had solar panels installed on our roof. I wanted to share our experience with the process, costs, and the impact on our energy bills so far.',
    author: {
      name: 'Jennifer Adams',
      avatar: '',
      role: 'client'
    },
    date: '2023-05-28',
    comments: 12,
    likes: 19,
    tags: ['solar', 'renewable', 'installation']
  }
])

// Popular tags
const popularTags = ref([
  { name: 'renovation', count: 45 },
  { name: 'plumbing', count: 38 },
  { name: 'electrical', count: 32 },
  { name: 'maintenance', count: 29 },
  { name: 'tips', count: 27 },
  { name: 'recommendation', count: 24 },
  { name: 'project', count: 21 },
  { name: 'diy', count: 19 },
  { name: 'contractor', count: 17 },
  { name: 'winter', count: 15 }
])

// Active members
const activeMembers = ref([
  { name: 'Michael Rodriguez', role: 'service_agent', posts: 28 },
  { name: 'Sarah Johnson', role: 'client', posts: 24 },
  { name: 'David Wilson', role: 'service_agent', posts: 22 },
  { name: 'Emily Chen', role: 'client', posts: 19 },
  { name: 'Jennifer Adams', role: 'client', posts: 17 }
])

// Get role badge variant
const getRoleBadgeVariant = (role: string) => {
  if (role === 'service_agent') return 'secondary'
  if (role === 'admin') return 'primary'
  return 'success'
}

// Get role display name
const getRoleDisplay = (role: string) => {
  if (role === 'service_agent') return 'Service Agent'
  if (role === 'admin') return 'Admin'
  return 'Client'
}
</script>

<template>
  <MainLayout>
    <!-- Hero Section -->
    <section class="py-16 bg-primary-50">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="heading-1 mb-6 text-primary-900">Community Forum</h1>
          <p class="text-body mb-8">
            Connect with other homeowners and service providers in the FAIT Co-op community. Share experiences, ask questions, and learn from each other.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="primary" size="lg">Create New Post</Button>
            <Button variant="outline" size="lg">Browse Categories</Button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Main Content -->
    <section class="py-16 bg-white">
      <div class="container-wide">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Sidebar -->
          <div class="lg:col-span-1 order-2 lg:order-1">
            <!-- Search -->
            <Card variant="outline" padding="lg" class="mb-8">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search community posts..."
                  class="w-full px-4 py-2 pl-10 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </Card>
            
            <!-- Popular Tags -->
            <Card variant="outline" padding="lg" class="mb-8">
              <h3 class="text-lg font-semibold mb-4">Popular Tags</h3>
              <div class="flex flex-wrap gap-2">
                <Badge 
                  v-for="tag in popularTags" 
                  :key="tag.name" 
                  variant="outline" 
                  class="cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
                >
                  {{ tag.name }} ({{ tag.count }})
                </Badge>
              </div>
            </Card>
            
            <!-- Active Members -->
            <Card variant="outline" padding="lg">
              <h3 class="text-lg font-semibold mb-4">Active Members</h3>
              <div class="space-y-4">
                <div v-for="member in activeMembers" :key="member.name" class="flex items-center">
                  <Avatar :initials="member.name.substring(0, 2)" size="sm" />
                  <div class="ml-3">
                    <p class="text-sm font-medium">{{ member.name }}</p>
                    <div class="flex items-center">
                      <Badge :variant="getRoleBadgeVariant(member.role)" size="sm">
                        {{ getRoleDisplay(member.role) }}
                      </Badge>
                      <span class="text-xs text-neutral-500 ml-2">{{ member.posts }} posts</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <!-- Posts -->
          <div class="lg:col-span-2 order-1 lg:order-2">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold">Recent Discussions</h2>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-neutral-500">Sort by:</span>
                <select class="text-sm border-none bg-transparent focus:outline-none focus:ring-0 text-neutral-700 font-medium">
                  <option>Recent</option>
                  <option>Popular</option>
                  <option>Most Comments</option>
                </select>
              </div>
            </div>
            
            <div class="space-y-6">
              <Card 
                v-for="post in posts" 
                :key="post.id" 
                variant="outline" 
                padding="lg" 
                shadow="hover" 
                class="transition-all duration-300 hover:-translate-y-1"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center">
                    <Avatar :initials="post.author.name.substring(0, 2)" size="md" />
                    <div class="ml-3">
                      <p class="font-medium">{{ post.author.name }}</p>
                      <div class="flex items-center">
                        <Badge :variant="getRoleBadgeVariant(post.author.role)" size="sm">
                          {{ getRoleDisplay(post.author.role) }}
                        </Badge>
                        <span class="text-xs text-neutral-500 ml-2">{{ post.date }}</span>
                      </div>
                    </div>
                  </div>
                  <button class="text-neutral-400 hover:text-neutral-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>
                
                <h3 class="text-xl font-semibold mb-2">{{ post.title }}</h3>
                <p class="text-neutral-600 mb-4">{{ post.content }}</p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                  <Badge 
                    v-for="tag in post.tags" 
                    :key="tag" 
                    variant="outline" 
                    size="sm"
                  >
                    {{ tag }}
                  </Badge>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <div class="flex items-center space-x-4">
                    <button class="flex items-center text-neutral-500 hover:text-primary-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{{ post.likes }}</span>
                    </button>
                    <button class="flex items-center text-neutral-500 hover:text-primary-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{{ post.comments }}</span>
                    </button>
                    <button class="flex items-center text-neutral-500 hover:text-primary-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                  <Button variant="outline" size="sm">View Discussion</Button>
                </div>
              </Card>
            </div>
            
            <div class="mt-8 flex justify-center">
              <Button variant="outline">Load More</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="py-16 bg-primary-50">
      <div class="container-wide">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="heading-2 mb-6 text-primary-900">Join the Conversation</h2>
          <p class="text-body mb-8">
            Share your experiences, ask questions, and connect with other members of the FAIT Co-op community.
          </p>
          <Button variant="primary" size="lg">Create an Account</Button>
        </div>
      </div>
    </section>
  </MainLayout>
</template>

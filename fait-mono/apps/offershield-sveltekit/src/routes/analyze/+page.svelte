<script lang="ts">
  import { onMount } from 'svelte';
  import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-svelte';
  
  let files: FileList | null = null;
  let isDragging = false;
  let isAnalyzing = false;
  let analysisComplete = false;
  let analysisResults: any = null;
  
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }
  
  function handleDragLeave() {
    isDragging = false;
  }
  
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    }
  }
  
  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      files = target.files;
    }
  }
  
  async function analyzeQuote() {
    if (!files || files.length === 0) return;
    
    isAnalyzing = true;
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock analysis results
      analysisResults = {
        riskScore: 65,
        issues: [
          {
            type: 'pricing',
            severity: 'high',
            description: 'Labor costs appear to be 20% above market rate for your area.'
          },
          {
            type: 'terms',
            severity: 'medium',
            description: 'Payment schedule requires 50% upfront, which is higher than recommended.'
          },
          {
            type: 'scope',
            severity: 'medium',
            description: 'Vague description of materials to be used could lead to quality issues.'
          },
          {
            type: 'timeline',
            severity: 'low',
            description: 'No specific completion date mentioned in the quote.'
          }
        ],
        recommendations: [
          'Negotiate labor costs down by 15-20%',
          'Request a more detailed breakdown of materials to be used',
          'Propose a payment schedule of 30% upfront, 30% at midpoint, 40% upon completion',
          'Add a specific completion date with penalties for delays'
        ]
      };
      
      isAnalyzing = false;
      analysisComplete = true;
    }, 3000);
  }
  
  function resetAnalysis() {
    files = null;
    analysisComplete = false;
    analysisResults = null;
  }
  
  $: fileName = files && files.length > 0 ? files[0].name : '';
  $: fileSize = files && files.length > 0 ? formatFileSize(files[0].size) : '';
  
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="text-3xl font-bold text-gray-900 mb-6">Analyze Contractor Quote</h1>
  
  {#if !analysisComplete}
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <p class="text-gray-600 mb-6">
        Upload your contractor quote to get an AI-powered analysis of potential risks, pricing issues, and negotiation recommendations.
      </p>
      
      <!-- File Upload Area -->
      <div 
        class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
        class:border-primary-300={isDragging}
        class:bg-primary-50={isDragging}
        class:border-gray-300={!isDragging}
        class:hover:bg-gray-50={!isDragging}
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
      >
        {#if !files || files.length === 0}
          <div class="flex flex-col items-center">
            <Upload class="w-12 h-12 text-gray-400 mb-4" />
            <p class="text-lg font-medium text-gray-700 mb-1">Drag and drop your quote file here</p>
            <p class="text-sm text-gray-500 mb-4">or click to browse files</p>
            <p class="text-xs text-gray-500">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
          </div>
          <input 
            type="file" 
            id="quote-file" 
            accept=".pdf,.jpg,.jpeg,.png" 
            class="hidden" 
            on:change={handleFileSelect}
          />
          <label 
            for="quote-file" 
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Select File
          </label>
        {:else}
          <div class="flex items-center justify-center">
            <FileText class="w-8 h-8 text-primary-600 mr-3" />
            <div class="text-left">
              <p class="text-lg font-medium text-gray-700">{fileName}</p>
              <p class="text-sm text-gray-500">{fileSize}</p>
            </div>
          </div>
          <div class="mt-4 flex justify-center space-x-4">
            <button 
              type="button" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              on:click={analyzeQuote}
              disabled={isAnalyzing}
            >
              {#if isAnalyzing}
                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              {:else}
                Analyze Quote
              {/if}
            </button>
            <button 
              type="button" 
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              on:click={resetAnalysis}
              disabled={isAnalyzing}
            >
              Change File
            </button>
          </div>
        {/if}
      </div>
    </div>
    
    {#if isAnalyzing}
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <Loader2 class="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Quote</h2>
        <p class="text-gray-600">
          Our AI is reviewing your quote for potential risks, pricing issues, and negotiation opportunities.
        </p>
      </div>
    {/if}
  {:else}
    <!-- Analysis Results -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Analysis Results</h2>
        <button 
          type="button" 
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          on:click={resetAnalysis}
        >
          Analyze Another Quote
        </button>
      </div>
      
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-medium text-gray-900">Risk Score</h3>
          <div class="text-lg font-semibold" class:text-red-600={analysisResults.riskScore > 70} class:text-yellow-600={analysisResults.riskScore > 30 && analysisResults.riskScore <= 70} class:text-green-600={analysisResults.riskScore <= 30}>
            {analysisResults.riskScore}/100
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="h-2.5 rounded-full" 
            class:bg-red-600={analysisResults.riskScore > 70}
            class:bg-yellow-500={analysisResults.riskScore > 30 && analysisResults.riskScore <= 70}
            class:bg-green-500={analysisResults.riskScore <= 30}
            style="width: {analysisResults.riskScore}%"
          ></div>
        </div>
        <p class="mt-2 text-sm text-gray-500">
          {#if analysisResults.riskScore > 70}
            High risk. We recommend significant negotiation before proceeding.
          {:else if analysisResults.riskScore > 30}
            Medium risk. Some issues should be addressed before signing.
          {:else}
            Low risk. This quote appears to be fair and well-structured.
          {/if}
        </p>
      </div>
      
      <div class="mb-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Identified Issues</h3>
        <div class="space-y-4">
          {#each analysisResults.issues as issue}
            <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div class="flex items-start">
                <div class="mr-3 mt-0.5">
                  <AlertTriangle 
                    class="w-5 h-5" 
                    class:text-red-500={issue.severity === 'high'}
                    class:text-yellow-500={issue.severity === 'medium'}
                    class:text-blue-500={issue.severity === 'low'}
                  />
                </div>
                <div>
                  <div class="flex items-center">
                    <span 
                      class="text-xs font-medium px-2 py-0.5 rounded-full mr-2"
                      class:bg-red-100={issue.severity === 'high'}
                      class:text-red-800={issue.severity === 'high'}
                      class:bg-yellow-100={issue.severity === 'medium'}
                      class:text-yellow-800={issue.severity === 'medium'}
                      class:bg-blue-100={issue.severity === 'low'}
                      class:text-blue-800={issue.severity === 'low'}
                    >
                      {issue.severity.toUpperCase()}
                    </span>
                    <span class="text-sm font-medium text-gray-700 uppercase">{issue.type}</span>
                  </div>
                  <p class="text-gray-600 mt-1">{issue.description}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
        <ul class="space-y-2">
          {#each analysisResults.recommendations as recommendation}
            <li class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span class="text-gray-600">{recommendation}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    
    <div class="bg-primary-50 p-6 rounded-lg border border-primary-200">
      <h3 class="text-lg font-medium text-primary-800 mb-3">Need Professional Help?</h3>
      <p class="text-primary-700 mb-4">
        Get personalized assistance from our contractor experts to help you negotiate better terms.
      </p>
      <a 
        href="/contact" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Contact an Expert
      </a>
    </div>
  {/if}
</div>

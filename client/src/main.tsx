import { createRoot } from 'react-dom/client'
import './index.css'
import App from './Home.tsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { DataProvider } from '@data-client/react'


import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>

    <MantineProvider>
    <DataProvider> 
    <BrowserRouter>
        <App />
      </BrowserRouter>
    </DataProvider>
    </MantineProvider>
  </QueryClientProvider>,
)




import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'cms/:content_page_id',
    loadComponent: () => import('./pages/cms/cms.page').then( m => m.CmsPage)
  },
  {
    path: 'steps',
    loadComponent: () => import('./pages/steps/steps.page').then( m => m.StepsPage)
  },
  {
    path: 'faqs/:content_page_id',
    loadComponent: () => import('./pages/faqs/faqs.page').then( m => m.FaqsPage)
  },
  {
    path: 'location/:location_id',
    loadComponent: () => import('./pages/location/location.page').then( m => m.LocationPage)
  },
  {
    path: 'spot/:spot_id',
    loadComponent: () => import('./pages/spot/spot.page').then( m => m.SpotPage)
  },
  {
    path: 'day/:spot_id/:year/:currentMonth/:dayNumber',
    loadComponent: () => import('./pages/day/day.page').then( m => m.DayPage)
  },
  {
    path: 'pt/:personal_trainer_id',
    loadComponent: () => import('./pages/pt/pt.page').then( m => m.PtPage)
  },
  {
    path: 'spots',
    loadComponent: () => import('./pages/spots/spots.page').then( m => m.SpotsPage)
  },
  {
    path: 'pts',
    loadComponent: () => import('./pages/pts/pts.page').then( m => m.PtsPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then( m => m.CartPage)
  },
  {
    path: 'personal-trainer-area',
    loadComponent: () => import('./pages/personal-trainer-area/personal-trainer-area.page').then( m => m.PersonalTrainerAreaPage)
  },
  {
    path: 'fitness-guide',
    loadComponent: () => import('./pages/fitness-guide/fitness-guide.page').then( m => m.FitnessGuidePage)
  },
  {
    path: 'pack/:pack_id',
    loadComponent: () => import('./pages/pack/pack.page').then( m => m.PackPage)
  },



];

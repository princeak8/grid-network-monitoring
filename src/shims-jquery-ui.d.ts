// This file provides type declarations for modules that don't have their own TypeScript definitions
// or need additional type information

// jQuery UI Widgets
// declare module 'jquery-ui/ui/widgets/slider' {
//     const content: any;
//     export default content;
//   }
  
//   declare module 'jquery-ui/ui/widgets/datepicker' {
//     const content: any;
//     export default content;
//   }
  
//   declare module 'jquery-ui/ui/widgets/*' {
//     const content: any;
//     export default content;
//   }
  
//   // jQuery UI CSS
//   declare module 'jquery-ui/themes/base/all.css' {
//     const content: any;
//     export default content;
//   }
  
  // Make sure jQuery can be used as a global variable
  interface Window {
    $: any;
    jQuery: any;
  }
  // Extend the global window object to ensure jQuery is recognized
  export {}; // Make this a module
  declare global {
    interface Window {
      $: JQuery;
      jQuery: JQuery;
    }
  }
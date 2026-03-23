<script lang="ts">
    import splash_1_src from '../../assets/content/Splash-Not_Unreal.png';
    import splash_2_src from '../../assets/content/Splash-Liminal_Runtime.png';
  
    import { GameState, setGameState } from '../state/game.svelte';
    import { splashAnim } from '../actions/animations.svelte';
  
    let currentSplashIndex = $state(0);
    
    const splashSequence = [
      { src: splash_1_src, duration: 3500 },
      { src: splash_2_src, duration: 3500 }
    ];
  
    $effect(() => {
      const startSequence = async () => {
        setGameState(GameState.SPLASH);
  
        for (let i = 0; i < splashSequence.length; i++) {
          currentSplashIndex = i;
          await new Promise(resolve => setTimeout(resolve, splashSequence[i].duration));
        }
  
        // Übergang zum Hauptmenü
        setGameState(GameState.MAIN_MENU);
      };
  
      startSequence();
    });
  </script>
  
  <div class="absolute inset-0 bg-black flex items-center justify-center z-50">
    {#key currentSplashIndex}
      <img 
        use:splashAnim
        src={splashSequence[currentSplashIndex]?.src} 
        alt="Splash Logo" 
        class="absolute max-w-sm h-auto"
      />
    {/key}
  </div>
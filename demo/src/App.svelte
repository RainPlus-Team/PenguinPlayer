<svelte:head>
    <title>Penguin Player</title>
</svelte:head>

<div class="header">
    <img src="../assets/images/background.webp"/>
    <div class="wrapper">
        <h1 class="title">Penguin Player</h1>
    </div>
</div>
<a href="https://flic.kr/p/21UXAyP">background reference</a>

<style lang="scss">
    .header {
      position: relative;
      max-height: 700px;

      img {
        min-height: 300px;
        max-width: 100vw;
        object-fit: cover;
      }

      .wrapper {
        position: absolute;
        top: 5%;
        width: 60vw;
        margin: 0 auto;

        h1, p {
          margin: 0;
        }

        .title {
          font-family: "Cardo", serif;
          font-weight: bold;
        }
      }

      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100px;
        background: linear-gradient(to bottom, transparent, white);
      }
    }
</style>

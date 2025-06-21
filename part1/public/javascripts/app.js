const { createApp } = Vue;
createApp({
  data() {
    return {
      dogImage: '',
      dogName: 'German Shepherd'
    };
  },
  methods: {
    async fetchDog() {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await res.json();
      this.dogImage = data.message;
    }
  },
  mounted() {
    this.fetchDog();
  }
}).mount('#app');

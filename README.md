 [![Contributors][contributors-shield]][contributors-url]
[![Forks][esgi-shield]][esgi-url]
[![LinkedIn][linkedin-shield-victor]][linkedin-url-victor]
[![LinkedIn][linkedin-shield-elisa]][linkedin-url-elisa]
[![LinkedIn][linkedin-shield-taj]][linkedin-url-taj]
[![PlayStore][android-shield]][android-url]
[![AppStore][ios-shield]][ios-url]

<br />

<p align="center">
  <a href="https://github.com/BookAppPA">
    <img src="https://github.com/BookAppPA/MobileApp/blob/main/assets/logo.png?raw=true" alt="Logo" width="200" height="200">
  </a>


  <h3 align="center">BookWorm Flutter</h3>

  <p align="center">
    An Awesome Book Social Media made in Flutter!
    <br />
    <a href="https://github.com/BookAppPA/API/blob/master/README.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    ·
    <a href="https://github.com/BookAppPA/API/issues">Report Bug</a>
    ·
    <a href="https://github.com/BookAppPA/API/issues">Request Feature</a>
    ·
  </p>
</p>



  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>


## About The Project

[![BookWorm Screen Shot][product-screenshot]]

BookWorm is a mobile application available on Android and IOS that lives up to its name because it is intended for book lovers. The objective of this application is simple, to help you find your future favorite book. To do this, you will get advice from passionate booksellers and recommendations made by an algorithm that learns from your previous readings / reviews that you have completed on the application. But that's not all, you can follow readers who love the same literary genre (or not for that matter...) and have access to their library and their opinion on each book. You can feed your profile with your readings and the comments you want to send to people following your profile.

### Built With

* [Flutter](https://flutter.dev/)
* [Firebase](https://firebase.google.com/)
* [NodeJS](https://nodejs.org/en/)

## Getting Started


To get a local copy up and running follow these simple example steps.

```sh
git clone git@github.com:BookAppPA/API.git
```

```sh
cd API
```

```sh
cd functions && npm i 
```

<h3>Prerequisites</h3>

Install the required dependencies.

```sh
cd functions && npm i -g firebase-tools
```

```sh
npm i express
```

```sh
npm i cors 
```

You can also do a `npm install` inside the functions folder.

### Installation

1. Create a new project on https://firebase.google.com/

2. Go to `Project Settings/Service` and download the SDK Admin Firebase json file. Move it to `./function`and be sure to put it inside your `.gitignore` file.

3. Copy the project information

4. Go in `functions/index.js` and paste your project setting inside `config`.

   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```

5. Install NPM packages
   ```sh
   npm install
   ```

<h3>Run</h3>

Run it locally 

```sh
npm run serve
```



## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## License

Distributed under the MIT License. See `LICENSE` for more information.



## Contact

Taj Singh - tsingh@myges.fr

Victor Deyanovitch - vdeyanovitch@myges.fr

Elisa Gougerot - egougerot@myges.fr

## Acknowledgements
* [ReadMe Template](https://github.com/othneildrew/Best-README-Template/blob/master/README.md#contributing)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[android-shield]: https://img.shields.io/badge/Android-Store-brightgreen
[android-url]: https://play.google.com/store/apps?hl=fr&gl=US
[ios-shield]: https://img.shields.io/badge/iOS-Store-lightgrey
[ios-url]: https://www.apple.com/fr/itunes/
[contributors-shield]: https://img.shields.io/github/contributors/BookAppPA/MobileApp?color=%23ECECE5&logo=BookWorm&logoColor=%23000&style=socia
[contributors-url]: https://github.com/BookAppPA/MobileApp/graphs/contributors
[esgi-shield]: https://img.shields.io/badge/ESGI-PA-blue
[esgi-url]: https://www.esgi.fr/
[linkedin-shield-victor]: https://img.shields.io/badge/LinkedIn-Victor-blue
[linkedin-url-victor]: https://www.linkedin.com/in/victor-d-a32055163/
[linkedin-shield-elisa]: https://img.shields.io/badge/LinkedIn-Elisa-blue
[linkedin-url-elisa]: https://www.linkedin.com/in/elisa-gougerot/
[linkedin-shield-taj]: https://img.shields.io/badge/LinkedIn-Taj-blue
[linkedin-url-taj]: https://www.linkedin.com/in/tajsingh1596
[product-screenshot]: assets/store.png

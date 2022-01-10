document.getElementById("unmute").addEventListener("click", (e) => {
  //   console.log("Player wanna unmute");
  document.querySelectorAll("audio").forEach((item) => {
    item.volume = 1;
    if (item.id === "bgAudio") item.volume = 0.3;
  });

  document.getElementById("unmute").classList.add("hide");

  document.getElementById("mute").classList.remove("hide");
});

document.getElementById("mute").addEventListener("click", (e) => {
  //   console.log("Player wanna mute");
  document.querySelectorAll("audio").forEach((item) => {
    console.log();
    item.volume = 0;
  });

  document.getElementById("mute").classList.add("hide");

  document.getElementById("unmute").classList.remove("hide");
});

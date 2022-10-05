const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

/**
 * Sample JavaScript code for youtube.playlistItems.list
 * See instructions for running APIs Explorer code samples locally:
 * https://developers.google.com/explorer-help/code-samples#javascript
 */


//authenticate google sign in
function authenticate() {
return gapi.auth2.getAuthInstance()
    .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
    .then(function() { console.log("Sign-in successful"); },
            function(err) { console.error("Error signing in", err); });
}
function loadClient() {
gapi.client.setApiKey("AIzaSyBApTDIWjTq1piLbGqFRCXshiL8v8BuCYc");
return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(function() { console.log("GAPI client loaded for API"); },
            function(err) { console.error("Error loading GAPI client for API", err); });
}


// // Make sure the client is loaded and sign-in is complete before calling this method.
// function execute() {
// return gapi.client.youtube.channels.list({
//     part: 'snippet,contentDetails,statistics',
//     forUsername: 'vsauce'
// })
//     .then(function(response) {
//             // Handle the results here (response.result has the parsed body).
//             console.log("Response", response);
//             },
//             function(err) { console.error("Execute error", err); });
// }


gapi.load("client:auth2", function() {
gapi.auth2.init({client_id: "311012207302-h28pq4siu6dn4a3lpq1spo66ebpmt5la.apps.googleusercontent.com"});
});



// Form submit and change channel
channelForm.addEventListener('submit', e => {
  e.preventDefault();

  const channel = channelInput.value;

  getChannel(channel);
});

// Display channel data
function showChannelData(data) {
  const channelData = document.getElementById('channel-data');
  channelData.innerHTML = data;
}

// Get channel from API
function getChannel(channel) {
  gapi.client.youtube.channels
    .list({
      part: 'snippet,contentDetails,statistics',
      forUsername: channel
    })
    .then(response => {
      console.log(response);
      const channel = response.result.items[0];

      const output = `
        <ul class="collection">
          <li class="collection-item">Title: ${channel.snippet.title}</li>
          <li class="collection-item">ID: ${channel.id}</li>
          <li class="collection-item">Subscribers: ${numberWithCommas(
            channel.statistics.subscriberCount
          )}</li>
          <li class="collection-item">Views: ${numberWithCommas(
            channel.statistics.viewCount
          )}</li>
          <li class="collection-item">Videos: ${numberWithCommas(
            channel.statistics.videoCount
          )}</li>
        </ul>
        <p>${channel.snippet.description}</p> 
        <hr>
        <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${
          channel.snippet.customUrl
        }">Visit Channel</a>
      `;
      showChannelData(output);

      const playlistId = channel.contentDetails.relatedPlaylists.uploads;
      requestVideoPlaylist(playlistId);
    console.log(channel);
    })
    .catch(err => alert('No Channel By That Name'));
}

// Add commas to number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

//doing something
function requestVideoPlaylist(playlistId) {
  const requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 10
  };

  const request = gapi.client.youtube.playlistItems.list(requestOptions);

  request.execute(response => {
    console.log(response);
    const playListItems = response.result.items;
    if (playListItems) {
      let output = '<br><h4 class="center-align">Latest Videos</h4>';

      // Loop through videos and append output
      playListItems.forEach(item => {
        const videoId = item.snippet.resourceId.videoId;

        output += `
          <div class="col s3">
          <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        `;
      });

      // Output videos
      videoContainer.innerHTML = output;
    } else {
      videoContainer.innerHTML = 'No Uploaded Videos';
    }
  });
}
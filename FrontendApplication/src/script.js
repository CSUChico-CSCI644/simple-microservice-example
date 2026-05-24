var api = process.env.API_GATEWAY || '' // defaults to same-origin /api routes

$(document).ready(function() {
    $("#btn").click(function() {
        $.ajax({
            url: api + "/api/randomquote",
            type: "GET",
            dataType: "json",
            timeout: 3000,
            success: function(data) {
                $("#quote").removeClass('is-danger')
                $("#quote").addClass('is-link')
                $( "#quote" ).html(data.quote.quote + '</br><b>'+ data.quote.by +'</b>'+ '</br><i>Quotes Received:'+ data.quote.count +'</i>');
            },
            error: function(xmlhttprequest, textstatus, message) {
                $("#quote").removeClass('is-link')
                $("#quote").addClass('is-danger')
                if(textstatus==="timeout") {
                    $( "#quote" ).html("got timeout");
                } else {
                    $( "#quote" ).html(message);
                }
            }
        })
    })
})

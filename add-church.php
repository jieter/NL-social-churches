<?php

$libFilename = 'nl-churches.json';

header("Access-Control-Allow-Origin: *");
header('Content-type: text/json');

if (isset($_POST['json'])) {
        $entry = json_decode($_POST['json']);

        try {
                $str = file_get_contents($libFilename);
        } catch (Exception $e) {
                $str = '[]';
        }

        $lib = json_decode($str);

        // append entry
        $lib[] = $entry;

        $listJson = json_encode($lib);
        mail(
                'spam@jieter.nl',
                'nieuwe kerk voor NL-social-churches',
                "Deze nieuwe kerk: \n". $_POST['json']."\n\n".
                "De hele lijst: \n".
                $listJson
        );

        file_put_contents($libFilename, $listJson);

        echo '{"success": true}';

} else {
        echo '{"success": false, "error": "No payload"}';
}

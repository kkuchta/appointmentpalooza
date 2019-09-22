require 'sinatra'
require 'csv'
require 'active_support'
require 'active_support/core_ext'
require 'active_support/core_ext/time'

if development?
  require "sinatra/reloader"
  require 'pry-byebug'
end

# Enable CORS so that we can easily serve the backend and frontend from different
# host/port combos (eg localhost:1234 and localhost:4567).  In real life we'd
# want to limit this to only our actual hosts (or just set up a proxy such that
# both the frontend and backend are available via the same public host)
before do
  headers('Access-Control-Allow-Origin' => '*')
end

# Gets available slots for a given set of coaches
# Params:
#   - coach_names: ['Jane', 'Joe'] (returns all coaches if null or missing)
#   - slot_size: 30 (in minutes)
get '/slots' do
  slot_size = 30
  coaches = coach_slots(slot_size)
  coaches.to_json
end

post '/appointments' do
  slot = JSON.parse(request.body.read)
  puts "Saving #{slot}"
  # TODO: Validate input.  Also use a real database instead of a file.
  open('appointments.txt', 'a') do |f|
    f.puts slot.to_json
  end
end

# Returns:
# [
#   {
#    "start": "2019-01-01T14:00:00.000Z",
#    "coach": "Christy Schumm"
#   },
#   {...},
# ]
# Times are all as utc datetime objects in the next 7 days
def coach_slots(slot_size = 30)
  slots = []
  load_coaches.each do |availability|
      timezone_name = availability[:Timezone].split(' ', 2).last

      Time.use_zone(timezone_name) do
        day_sym = availability[:'Day of Week'].downcase.to_sym
        day = Time
          .now
          .in_time_zone
          .next_occurring(day_sym)

        # Start of availability
        available_at = Time.parse(availability[:'Available at'])
        availability_start =
          day.change(hour: available_at.hour, minute: available_at.min, seconds: 0)

        # End of availability
        available_until = Time.parse(availability[:'Available until'])
        availability_finish =
          day.change(hour: available_until.hour, min: available_until.min)

        # Starting from availability_start, roll forward in increments of X
        # minutes and add each to the list of timeslots for this coach.
        current_time = availability_start
        loop do
          slots << { start: current_time.utc, coach: availability[:Name] }
          current_time = current_time.advance(minutes: slot_size)
          break if current_time >= availability_finish
        end
      end
    end
  slots.sort_by { |slot| slot[:start] }
end

# Return raw coach hashes
def load_coaches
  coach_data = load_csv('coaches.csv')
end

# Returns an array of hashes with column names as keys
def load_csv(filename)
  return [] unless File.exists?(filename)
  CSV
    .foreach(filename, headers: true)
    .map { |row| row.to_h.symbolize_keys }
end
